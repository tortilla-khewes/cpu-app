import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, records
from app.database import ensure_db_exists, close_client
from app.config import settings
from contextlib import asynccontextmanager

_LOCAL_DB_FILE = Path(__file__).parent.parent / "local_db.json"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_db_exists()
    yield
    await close_client()


app = FastAPI(title="Tortilla CPU CCP API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(records.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/migrate")
async def migrate_from_local():
    """One-time migration: upsert all records from local_db.json into Cosmos DB."""
    if settings.use_local_db:
        raise HTTPException(status_code=400, detail="USE_LOCAL_DB is true — point at Cosmos before migrating")

    if not _LOCAL_DB_FILE.exists():
        raise HTTPException(status_code=404, detail="local_db.json not found")

    data = json.loads(_LOCAL_DB_FILE.read_text(encoding="utf-8"))
    source_records = data.get("records", {})

    if not source_records:
        return {"migrated": 0, "message": "No records found in local_db.json"}

    from app.database import get_container
    container = await get_container()

    migrated = 0
    errors = []
    for record_id, doc in source_records.items():
        # Ensure required Cosmos fields are present
        doc.setdefault("id", record_id)
        doc.setdefault("record_id", record_id)
        try:
            await container.upsert_item(body=doc)
            migrated += 1
        except Exception as exc:
            errors.append({"record_id": record_id, "error": str(exc)})

    return {"migrated": migrated, "errors": errors}

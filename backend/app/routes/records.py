from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime
from app.config import settings
from app.database import get_container
from app.models.record import Record, RecordCreate, RecordUpdate

router = APIRouter(prefix="/records", tags=["records"])
security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("", response_model=Record)
async def create_record(body: RecordCreate, token: dict = Depends(verify_token)):
    container = await get_container()
    record = Record(
        form_type=body.form_type,
        product_key=body.product_key,
        product_name=body.product_name,
        date_of_production=body.date_of_production,
        use_by_date=body.use_by_date,
        lot_number=body.lot_number,
        batch_size=body.batch_size,
        ingredients=body.ingredients,
        form_data=body.form_data,
    )
    doc = record.model_dump()
    doc["id"] = record.record_id
    await container.create_item(body=doc)
    return record


@router.get("", response_model=list[Record])
async def list_records(
    token: dict = Depends(verify_token),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    product_key: str | None = Query(None),
    status: str | None = Query(None),
):
    container = await get_container()
    conditions = []
    params = []

    if date_from:
        conditions.append("c.date_of_production >= @date_from")
        params.append({"name": "@date_from", "value": date_from})
    if date_to:
        conditions.append("c.date_of_production <= @date_to")
        params.append({"name": "@date_to", "value": date_to})
    if product_key:
        conditions.append("c.product_key = @product_key")
        params.append({"name": "@product_key", "value": product_key})
    if status:
        conditions.append("c.status = @status")
        params.append({"name": "@status", "value": status})

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    query = f"SELECT * FROM c {where} ORDER BY c.created_at DESC"

    items = []
    async for item in container.query_items(query=query, parameters=params):
        items.append(item)
    return items


@router.get("/{record_id}", response_model=Record)
async def get_record(record_id: str, token: dict = Depends(verify_token)):
    container = await get_container()
    query = "SELECT * FROM c WHERE c.record_id = @id"
    params = [{"name": "@id", "value": record_id}]
    items = []
    async for item in container.query_items(query=query, parameters=params):
        items.append(item)
    if not items:
        raise HTTPException(status_code=404, detail="Record not found")
    return items[0]


@router.put("/{record_id}", response_model=Record)
async def update_record(
    record_id: str,
    body: RecordUpdate,
    token: dict = Depends(verify_token),
):
    container = await get_container()
    query = "SELECT * FROM c WHERE c.record_id = @id"
    params = [{"name": "@id", "value": record_id}]
    items = []
    async for item in container.query_items(query=query, parameters=params):
        items.append(item)
    if not items:
        raise HTTPException(status_code=404, detail="Record not found")

    doc = items[0]
    update_data = body.model_dump(exclude_none=True)

    if "form_data" in update_data:
        existing = doc.get("form_data", {})
        for key, val in update_data["form_data"].items():
            if isinstance(val, dict) and isinstance(existing.get(key), dict):
                existing[key].update(val)
            else:
                existing[key] = val
        update_data["form_data"] = existing

    doc.update(update_data)
    doc["updated_at"] = datetime.utcnow().isoformat()

    if body.manager_check and body.manager_check.strip() and doc.get("status") == "draft":
        doc["status"] = "awaiting_manager_check"

    await container.replace_item(item=doc["id"], body=doc)
    return doc


@router.delete("/{record_id}", status_code=204)
async def delete_record(record_id: str, token: dict = Depends(verify_token)):
    if token.get("role") not in ("manager", "supervisor"):
        raise HTTPException(status_code=403, detail="Manager access required")
    container = await get_container()
    query = "SELECT * FROM c WHERE c.record_id = @id"
    params = [{"name": "@id", "value": record_id}]
    items = []
    async for item in container.query_items(query=query, parameters=params):
        items.append(item)
    if not items:
        raise HTTPException(status_code=404, detail="Record not found")
    doc = items[0]
    if doc.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Only draft records can be deleted")
    await container.delete_item(item=doc["id"], partition_key=doc["record_id"])

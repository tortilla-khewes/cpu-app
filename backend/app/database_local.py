"""
Local JSON file store used when USE_LOCAL_DB=true.
Mimics the async Cosmos DB container interface used in routes.
"""
import json
import os
from pathlib import Path

DB_FILE = Path(__file__).parent.parent / "local_db.json"


def _load() -> dict:
    if DB_FILE.exists():
        return json.loads(DB_FILE.read_text(encoding="utf-8"))
    return {"records": {}}


def _save(data: dict):
    DB_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


class LocalContainer:
    async def create_item(self, body: dict):
        data = _load()
        data["records"][body["id"]] = body
        _save(data)
        return body

    async def replace_item(self, item: str, body: dict):
        data = _load()
        data["records"][item] = body
        _save(data)
        return body

    async def delete_item(self, item: str, partition_key: str):
        data = _load()
        data["records"].pop(item, None)
        _save(data)

    async def query_items(self, query: str, parameters: list | None = None):
        data = _load()
        items = list(data["records"].values())

        # Parse parameters into a simple key→value map
        params = {p["name"]: p["value"] for p in (parameters or [])}

        # Apply filters based on which named params are present
        if "@date_from" in params:
            items = [i for i in items if i.get("date_of_production", "") >= params["@date_from"]]
        if "@date_to" in params:
            items = [i for i in items if i.get("date_of_production", "") <= params["@date_to"]]
        if "@product_key" in params:
            items = [i for i in items if i.get("product_key") == params["@product_key"]]
        if "@status" in params:
            items = [i for i in items if i.get("status") == params["@status"]]
        if "@id" in params:
            items = [i for i in items if i.get("record_id") == params["@id"]]

        # Yield items one by one to match the async iterator interface
        for item in sorted(items, key=lambda x: x.get("created_at", ""), reverse=True):
            yield item


_local_container = LocalContainer()


async def get_container():
    return _local_container


async def close_client():
    pass


async def ensure_db_exists():
    if not DB_FILE.exists():
        _save({"records": {}})
    print(f"[LOCAL DB] Using JSON store at {DB_FILE}")

from app.config import settings

if settings.use_local_db:
    from app.database_local import get_container, close_client, ensure_db_exists
else:
    from azure.cosmos.aio import CosmosClient
    from azure.cosmos import PartitionKey

    _client = None
    _container = None

    def _make_client() -> CosmosClient:
        if settings.cosmos_connection_string:
            return CosmosClient.from_connection_string(settings.cosmos_connection_string)
        return CosmosClient(settings.cosmos_endpoint, credential=settings.cosmos_key)

    async def get_container():
        global _client, _container
        if _container is None:
            _client = _make_client()
            db = _client.get_database_client(settings.cosmos_db_name)
            _container = db.get_container_client(settings.cosmos_container_name)
        return _container

    async def close_client():
        global _client, _container
        if _client:
            await _client.close()
            _client = None
            _container = None

    async def ensure_db_exists():
        client = _make_client()
        db = await client.create_database_if_not_exists(settings.cosmos_db_name)
        await db.create_container_if_not_exists(
            id=settings.cosmos_container_name,
            partition_key=PartitionKey(path="/record_id"),
        )
        await client.close()

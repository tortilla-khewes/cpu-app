from app.config import settings

if settings.use_local_db:
    from app.database_local import get_container, close_client, ensure_db_exists
else:
    from azure.cosmos.aio import CosmosClient
    from azure.cosmos import PartitionKey

    _client = None
    _container = None

    async def get_container():
        global _client, _container
        if _container is None:
            _client = CosmosClient(settings.cosmos_endpoint, credential=settings.cosmos_key)
            db = _client.get_database_client(settings.cosmos_database)
            _container = db.get_container_client(settings.cosmos_container)
        return _container

    async def close_client():
        global _client, _container
        if _client:
            await _client.close()
            _client = None
            _container = None

    async def ensure_db_exists():
        client = CosmosClient(settings.cosmos_endpoint, credential=settings.cosmos_key)
        db = await client.create_database_if_not_exists(settings.cosmos_database)
        await db.create_container_if_not_exists(
            id=settings.cosmos_container,
            partition_key=PartitionKey(path="/product_key"),
        )
        await client.close()

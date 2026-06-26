import sys
from pydantic import model_validator
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    operative_pin: str = "1234"
    manager_pin: str = "5678"
    supervisor_pin: str = "1234"
    use_local_db: bool = False
    # Connection string auth (preferred)
    cosmos_connection_string: Optional[str] = None
    cosmos_db_name: str = "cpu_db"
    cosmos_container_name: str = "records"
    # Endpoint + key auth (fallback)
    cosmos_endpoint: Optional[str] = None
    cosmos_key: Optional[str] = None
    jwt_secret: str = "demo-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 24
    # CORS — comma-separated list of allowed origins, e.g.:
    #   CORS_ORIGINS=https://ashy-glacier-0a0f3fd03.azurestaticapps.net,https://localhost:5173
    # Defaults to wildcard for local development only.
    cors_origins: list[str] = ["*"]

    @model_validator(mode="after")
    def _validate_production_config(self) -> "Settings":
        if self.use_local_db:
            return self

        # Cosmos DB connectivity is required in non-local mode
        has_connection_string = bool(self.cosmos_connection_string)
        has_endpoint_key = bool(self.cosmos_endpoint and self.cosmos_key)
        if not has_connection_string and not has_endpoint_key:
            print(
                "ERROR: Cosmos DB credentials are required when USE_LOCAL_DB=false.\n"
                "  Set COSMOS_CONNECTION_STRING (preferred), or both COSMOS_ENDPOINT and COSMOS_KEY.",
                file=sys.stderr,
            )
            sys.exit(1)

        # Warn loudly if the default JWT secret is still in use
        if self.jwt_secret == "demo-secret-change-in-production":
            print(
                "WARNING: JWT_SECRET is set to the insecure default. "
                "Set a strong random value in production.",
                file=sys.stderr,
            )

        return self

    class Config:
        env_file = ".env"


settings = Settings()

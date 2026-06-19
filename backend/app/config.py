from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    operative_pin: str = "1234"
    manager_pin: str = "5678"
    supervisor_pin: str = "1234"
    use_local_db: bool = False
    cosmos_endpoint: Optional[str] = None
    cosmos_key: Optional[str] = None
    cosmos_database: str = "cpu_db"
    cosmos_container: str = "records"
    jwt_secret: str = "demo-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 24

    class Config:
        env_file = ".env"


settings = Settings()

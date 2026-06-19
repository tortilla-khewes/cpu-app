from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class Ingredient(BaseModel):
    name: str
    std_quantity: str = ""
    date_code: str = ""
    batch_mill_1: str = ""
    batch_mill_2: str = ""
    added: bool = False


class Record(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    record_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    form_type: int
    product_key: str
    product_name: str
    status: str = "draft"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    lot_number: str = ""
    date_of_production: str
    use_by_date: str
    batch_size: Optional[int] = None
    ingredients: list[Ingredient] = []
    form_data: dict = {}
    manager_check: str = ""
    images: list[str] = []


class RecordCreate(BaseModel):
    form_type: int
    product_key: str
    product_name: str
    date_of_production: str
    use_by_date: str
    lot_number: str = ""
    batch_size: Optional[int] = None
    ingredients: list[Ingredient] = []
    form_data: dict = {}


class RecordUpdate(BaseModel):
    lot_number: Optional[str] = None
    date_of_production: Optional[str] = None
    use_by_date: Optional[str] = None
    batch_size: Optional[int] = None
    ingredients: Optional[list[Ingredient]] = None
    form_data: Optional[dict] = None
    manager_check: Optional[str] = None
    status: Optional[str] = None
    images: Optional[list[str]] = None

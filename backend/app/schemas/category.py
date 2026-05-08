from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CategoryCreate(BaseModel):
    name:        str
    description: Optional[str] = None


class CategoryUpdate(BaseModel):
    name:        Optional[str] = None
    description: Optional[str] = None


class CategoryOut(BaseModel):
    id:            int
    name:          str
    description:   Optional[str]
    created_at:    datetime
    product_count: int = 0

    model_config = {"from_attributes": True}
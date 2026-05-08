from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from decimal import Decimal


class ProductCreate(BaseModel):
    name:        str
    description: Optional[str] = None
    price:       Decimal
    quantity:    int
    threshold:   int = 10
    category_id: Optional[int] = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Price must be >= 0")
        return v

    @field_validator("quantity", "threshold")
    @classmethod
    def qty_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError("Value must be >= 0")
        return v


class ProductUpdate(BaseModel):
    name:        Optional[str]     = None
    description: Optional[str]    = None
    price:       Optional[Decimal] = None
    quantity:    Optional[int]     = None
    threshold:   Optional[int]     = None
    category_id: Optional[int]    = None


class ProductOut(BaseModel):
    id:            int
    name:          str
    description:   Optional[str]
    price:         Decimal
    quantity:      int
    threshold:     int
    category_id:   Optional[int]
    category_name: Optional[str] = None
    status:        str = "in_stock"  
    created_at:    datetime

    model_config = {"from_attributes": True}
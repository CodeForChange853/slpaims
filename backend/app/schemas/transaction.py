from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional
from app.models.transaction import TxType


class StockRequest(BaseModel):
    product_id: int
    quantity:   int
    note:       Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def qty_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be > 0")
        return v


class TransactionOut(BaseModel):
    id:           int
    product_id:   int
    product_name: Optional[str] = None
    type:         str
    quantity:     int
    stock_after:  int
    note:         Optional[str]
    created_at:   datetime

    model_config = {"from_attributes": True}
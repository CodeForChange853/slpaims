from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class TxType(str, enum.Enum):
    IN  = "in"
    OUT = "out"


class Transaction(Base):
    __tablename__ = "transactions"

    id          = Column(Integer, primary_key=True, index=True)
    product_id  = Column(Integer, ForeignKey("products.id"), nullable=False)
    type        = Column(Enum(TxType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    quantity    = Column(Integer, nullable=False)
    stock_after = Column(Integer, nullable=False)
    note        = Column(Text, nullable=True)
    created_by  = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    product     = relationship("Product", back_populates="transactions")
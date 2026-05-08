from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.product import Product
from app.models.transaction import Transaction, TxType
from app.schemas.transaction import StockRequest, TransactionOut
from app.utils.dependencies import get_current_user

router = APIRouter()


def _to_out(tx: Transaction) -> TransactionOut:
    data = TransactionOut.model_validate(tx)
    data.product_name = tx.product.name if tx.product else None
    return data


def _record(db: Session, product: Product, tx_type: TxType, qty: int, note: str, user_id: int) -> Transaction:
    product.quantity = product.quantity + qty if tx_type == TxType.IN else product.quantity - qty
    tx = Transaction(
        product_id=product.id,
        type=tx_type,
        quantity=qty,
        stock_after=product.quantity,
        note=note,
        created_by=user_id,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.post("/in", response_model=TransactionOut, status_code=201)
def stock_in(
    payload: StockRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    p = db.query(Product).filter(Product.id == payload.product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    tx = _record(db, p, TxType.IN, payload.quantity, payload.note or "Stock in", current_user.id)
    return _to_out(tx)


@router.post("/out", response_model=TransactionOut, status_code=201)
def stock_out(
    payload: StockRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    p = db.query(Product).filter(Product.id == payload.product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    if payload.quantity > p.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {p.quantity}, requested: {payload.quantity}",
        )
    tx = _record(db, p, TxType.OUT, payload.quantity, payload.note or "Stock out", current_user.id)
    return _to_out(tx)


@router.get("/history", response_model=List[TransactionOut])
def transaction_history(
    type:       Optional[str] = Query(None, description="Filter: 'in' or 'out'"),
    product_id: Optional[int] = Query(None),
    limit:      int           = Query(100, le=500),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Transaction)
    
    if type in ("in", "out"):
        q = q.filter(Transaction.type == TxType(type))
    if product_id:
        q = q.filter(Transaction.product_id == product_id)
    txs = q.order_by(Transaction.created_at.desc()).limit(limit).all()
    return [_to_out(t) for t in txs]
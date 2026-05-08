from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.transaction import Transaction, TxType
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/summary")
def summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    products = db.query(Product).all()
    total_value  = sum(float(p.price) * p.quantity for p in products)
    low_count    = sum(1 for p in products if p.quantity < p.threshold)
    out_count    = sum(1 for p in products if p.quantity == 0)
    tx_count     = db.query(Transaction).count()

    return {
        "total_products":  len(products),
        "total_value":     round(total_value, 2),
        "low_stock_count": low_count,
        "out_of_stock_count": out_count,
        "total_transactions": tx_count,
    }


@router.get("/inventory")
def inventory_report(db: Session = Depends(get_db), _=Depends(get_current_user)):
    products = db.query(Product).order_by(Product.name).all()
    items = []
    for p in products:
        items.append({
            "id":            p.id,
            "name":          p.name,
            "category":      p.category.name if p.category else "—",
            "price":         float(p.price),
            "quantity":      p.quantity,
            "threshold":     p.threshold,
            "total_value":   round(float(p.price) * p.quantity, 2),
            "status":        "out_of_stock" if p.quantity == 0
                             else "low_stock" if p.quantity < p.threshold
                             else "in_stock",
        })

    # Category totals for chart
    cat_totals = []
    cats = db.query(Category).all()
    for cat in cats:
        cat_products = [p for p in products if p.category_id == cat.id]
        cat_totals.append({
            "category":    cat.name,
            "total_qty":   sum(p.quantity for p in cat_products),
            "total_value": round(sum(float(p.price) * p.quantity for p in cat_products), 2),
        })

    return {"items": items, "by_category": cat_totals}


@router.get("/sales")
def sales_report(db: Session = Depends(get_db), _=Depends(get_current_user)):
    txs = (
        db.query(Transaction)
        .filter(Transaction.type == TxType.OUT)   # TxType.OUT is now "OUT" matching the DB
        .order_by(Transaction.created_at.desc())
        .all()
    )
    items = []
    total_revenue = 0
    total_units   = 0
    for tx in txs:
        price   = float(tx.product.price) if tx.product else 0
        revenue = price * tx.quantity
        total_revenue += revenue
        total_units   += tx.quantity
        items.append({
            "id":           tx.id,
            "date":         tx.created_at.strftime("%Y-%m-%d %H:%M"),
            "product_name": tx.product.name if tx.product else "—",
            "quantity":     tx.quantity,
            "unit_price":   price,
            "revenue":      round(revenue, 2),
            "note":         tx.note,
        })

    return {
        "total_transactions": len(items),
        "total_units_sold":   total_units,
        "total_revenue":      round(total_revenue, 2),
        "transactions":       items,
    }
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.routers import auth, products, categories, stock, reports
from app.models.user import User
from app.utils.security import hash_password

Base.metadata.create_all(bind=engine)

def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "admin").first()
        if not existing:
            db.add(User(
                username="admin",
                full_name="Administrator",
                role="admin",
                hashed_password=hash_password("adminsamboy123"),
                is_active=True,
            ))
            db.commit()
            print("✅ Admin seeded successfully")
        else:
            print("ℹ️ Admin already exists")
    except Exception as e:
        db.rollback()
        print(f"❌ seed_admin error: {e}")
    finally:
        db.close()

seed_admin()

app = FastAPI(
    title="SLPA-IMS API",
    description="Inventory Management System for Napalisan Islanders General Merchandise",
    version="1.0.0",
)

ALLOWED_ORIGINS = [
    "null",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://slpaims-1.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(products.router,   prefix="/api/products",   tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(stock.router,      prefix="/api/stock",      tags=["Stock"])
app.include_router(reports.router,    prefix="/api/reports",    tags=["Reports"])

@app.get("/debug/users", tags=["Debug"])
def debug_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return [
            {
                "id": u.id,
                "username": u.username,
                "full_name": u.full_name,
                "role": u.role,
                "is_active": u.is_active,
            }
            for u in users
        ]
    finally:
        db.close()
        
@app.get("/", tags=["Health"])
def root():
    return {"message": "SLPA-IMS API is running", "docs": "/docs"}
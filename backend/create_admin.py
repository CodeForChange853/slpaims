import sys
import os

sys.path.append(os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.utils.security import hash_password

# ── credentials 
USERNAME  = "admin"
PASSWORD  = "adminsamboy123"
FULL_NAME = "Administrator"
ROLE      = "admin"

def create_admin():
    Base.metadata.create_all(bind=engine)  
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == USERNAME).first()
        if existing:
            existing.hashed_password = hash_password(PASSWORD)
            existing.full_name = FULL_NAME
            existing.role = ROLE
            existing.is_active = True
            db.commit()
            print(f"✅ User '{USERNAME}' already existed — password updated to new value.")
        else:
            user = User(
                username=USERNAME,
                full_name=FULL_NAME,
                role=ROLE,
                hashed_password=hash_password(PASSWORD),
                is_active=True,
            )
            db.add(user)
            db.commit()
            print(f"✅ Admin user created successfully.")

        print(f"   Username : {USERNAME}")
        print(f"   Password : {PASSWORD}")
        print(f"   Role     : {ROLE}")
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
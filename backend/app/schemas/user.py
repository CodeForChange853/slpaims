from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    username:  str
    full_name: str
    password:  str
    role:      str = "admin"


class UserOut(BaseModel):
    id:        int
    username:  str
    full_name: str
    role:      str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type:   str
    user: UserOut


class LoginRequest(BaseModel):
    username: str
    password: str
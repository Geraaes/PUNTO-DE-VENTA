from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioOut
from app.services.usuarios_service import usuario_service
from app.middleware.auth_middleware import require_roles
from app.config.session import get_db

# Router
router = APIRouter(tags=["usuarios"])  # prefix se maneja en app.py

# Schemas adicionales
class LoginSchema(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UsuarioOut

# -------------------------------
# Rutas públicas
# -------------------------------
@router.post("/login", response_model=TokenResponse)
def login_user_route(data: LoginSchema, db: Session = Depends(get_db)):
    result = usuario_service.login(db, data.email, data.password)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    user = result["data"]["usuario"]
    token = result["data"]["token"]
    return TokenResponse(access_token=token, user=user)

@router.post("/register", response_model=UsuarioOut)
def register_user_route(data: UsuarioCreate, db: Session = Depends(get_db)):
    result = usuario_service.register(db, data.nombre, data.email, data.password, data.rol_id)
    return result["data"]["usuario"]

# -------------------------------
# Rutas protegidas
# -------------------------------
@router.get("/", response_model=List[UsuarioOut])
def list_users_route(db: Session = Depends(get_db), current_user=Depends(require_roles(["admin"]))):
    result = usuario_service.get_all_usuarios(db)
    return result["data"]

@router.get("/{usuario_id}", response_model=UsuarioOut)
def get_user_route(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin", "supervisor"], allow_self=True))
):
    result = usuario_service.get_usuario_by_id(db, usuario_id)
    return result["data"]

@router.put("/{usuario_id}", response_model=UsuarioOut)
def update_user_route(
    usuario_id: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"], allow_self=True))
):
    result = usuario_service.update_usuario(db, usuario_id, data.dict(exclude_unset=True))
    return result["data"]

@router.delete("/{usuario_id}", response_model=dict)
def delete_user_route(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    result = usuario_service.delete_usuario(db, usuario_id)
    return {"success": result.get("success", False), "message": result.get("message", "")}

# Exportar router
usuarios_router = router

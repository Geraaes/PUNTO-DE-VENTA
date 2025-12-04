from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.utils.helpers import hash_password, verify_password
from app.utils.jwt import create_access_token
import logging
import traceback

logger = logging.getLogger(__name__)

class UsuarioService:

    def get_all_usuarios(self, db: Session):
        try:
            usuarios = db.query(Usuario).options(selectinload(Usuario.rol)).order_by(Usuario.id.asc()).all()
            return {"success": True, "data": usuarios}
        except SQLAlchemyError as e:
            logger.error(f"Error en get_all_usuarios: {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="Error al obtener usuarios")

    def get_usuario_by_id(self, db: Session, user_id: int):
        try:
            usuario = db.query(Usuario).options(selectinload(Usuario.rol)).filter(Usuario.id == user_id).first()
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            return {"success": True, "data": usuario}
        except SQLAlchemyError as e:
            logger.error(f"Error en get_usuario_by_id: {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="Error al obtener usuario")

    def update_usuario(self, db: Session, user_id: int, user_data: dict):
        try:
            usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            if "password" in user_data:
                user_data["password_hash"] = hash_password(user_data["password"])
                del user_data["password"]

            for key, value in user_data.items():
                setattr(usuario, key, value)

            db.commit()
            db.refresh(usuario)
            return {"success": True, "data": usuario, "message": "Usuario actualizado exitosamente"}
        except SQLAlchemyError as e:
            logger.error(f"Error en update_usuario: {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="Error al actualizar usuario")

    def delete_usuario(self, db: Session, user_id: int):
        try:
            usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
            if not usuario:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            usuario.activo = False
            db.commit()
            return {"success": True, "message": "Usuario desactivado exitosamente"}
        except SQLAlchemyError as e:
            logger.error(f"Error en delete_usuario: {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="Error al desactivar usuario")

    def login(self, db: Session, email: str, password: str):
        try:
            usuario = db.query(Usuario).options(selectinload(Usuario.rol)).filter(Usuario.email == email).first()
            if not usuario or not usuario.activo:
                raise HTTPException(status_code=400, detail="Credenciales inválidas")

            if not verify_password(password, usuario.password_hash):
                raise HTTPException(status_code=400, detail="Credenciales inválidas")

            rol_nombre = usuario.rol.nombre if usuario.rol else "usuario"
            token = create_access_token({"id": usuario.id, "email": usuario.email, "rol": rol_nombre})

            return {"success": True, "data": {"usuario": usuario, "token": token}}

        except Exception as e:
            logger.error(f"Error en login: {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="Error al iniciar sesión")

    def register(self, db: Session, nombre: str, email: str, password: str, rol_id: int = 2):
        try:
            existing = db.query(Usuario).filter(Usuario.email == email).first()
            if existing:
                raise HTTPException(status_code=400, detail="El email ya está registrado")

            password_hash = hash_password(password)
            usuario = Usuario(nombre=nombre, email=email, password_hash=password_hash, rol_id=rol_id)
            db.add(usuario)
            db.commit()
            db.refresh(usuario)

            # Cargar rol
            db.refresh(usuario)
            rol_nombre = usuario.rol.nombre if usuario.rol else "usuario"
            token = create_access_token({"id": usuario.id, "email": usuario.email, "rol": rol_nombre})

            return {"success": True, "data": {"usuario": usuario, "token": token}}

        except Exception as e:
            logger.error(f"Error en register: {e}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail="Error al registrar usuario")

# Instancia única
usuario_service = UsuarioService()

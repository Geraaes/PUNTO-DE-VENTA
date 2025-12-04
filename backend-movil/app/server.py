# app/main.py
import os
import asyncio
import logging
from importlib import import_module

import uvicorn
from app.config.db import test_connection, sync_models
 # tu módulo db con SQLAlchemy
from app.app import app  # tu FastAPI app

# Configurar logger
logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

async def initialize_database():
    """
    Inicializa la base de datos: conexión, sincronización de modelos y seeds opcionales.
    """
    try:
        connected = await test_connection()
        if not connected:
            raise Exception("No se pudo conectar a la base de datos")

        if os.getenv("ENVIRONMENT") == "development":
            await sync_models()  # sincronizar modelos sin forzar borrado en producción

        # Ejecutar seed opcional
        try:
            seed_module = import_module("scripts.seed")
            if hasattr(seed_module, "seed_database"):
                await seed_module.seed_database()
                logger.info("✅ Seed ejecutado correctamente")
        except Exception as seed_error:
            logger.warning(f"⚠️ No se pudo ejecutar seed, continuar sin seed: {seed_error}")

        return True
    except Exception as error:
        logger.error(f"❌ Error inicializando base de datos: {error}")
        return False


async def main():
    # Inicializar DB antes de levantar el servidor
    db_initialized = await initialize_database()
    if not db_initialized:
        raise SystemExit("❌ Falló la inicialización de la base de datos")
# app/main.py
import os
import logging
from importlib import import_module

import uvicorn
from app.config.db import test_connection, sync_models  # funciones síncronas
from app.app import app  # FastAPI app

# Configurar logger
logger = logging.getLogger("uvicorn")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def initialize_database():
    """
    Inicializa la base de datos: conexión, sincronización de modelos y seeds opcionales.
    """
    try:
        connected = test_connection()
        if not connected:
            raise Exception("No se pudo conectar a la base de datos")

        if os.getenv("ENVIRONMENT") == "development":
            sync_models()  # sincronizar modelos sin forzar borrado en producción

        # Ejecutar seed opcional
        try:
            seed_module = import_module("scripts.seed")
            if hasattr(seed_module, "seed_database"):
                seed_module.seed_database()
                logger.info("✅ Seed ejecutado correctamente")
        except Exception as seed_error:
            logger.warning(f"⚠️ No se pudo ejecutar seed, continuar sin seed: {seed_error}")

        return True
    except Exception as error:
        logger.error(f"❌ Error inicializando base de datos: {error}")
        return False

def main():
    # Inicializar DB antes de levantar el servidor
    db_initialized = initialize_database()
    if not db_initialized:
        raise SystemExit("❌ Falló la inicialización de la base de datos")

    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 Servidor POS ejecutándose en puerto {port}")
    logger.info(f"📊 Environment: {os.getenv('ENVIRONMENT')}")
    logger.info(f"🌐 URL: http://localhost:{port}/")
    logger.info(f"🔍 Health: http://localhost:{port}/health")

    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("🛑 Servidor detenido manualmente")

    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 Servidor POS ejecutándose en puerto {port}")
    logger.info(f"📊 Environment: {os.getenv('ENVIRONMENT')}")
    logger.info(f"🌐 URL: http://localhost:{port}/")
    logger.info(f"🔍 Health: http://localhost:{port}/health")

    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Servidor detenido manualmente")

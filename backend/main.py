import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.convert import router
import config

app = FastAPI(title="Logo2Voxel 3D API", version="1.0.0")

origins = json.loads(config.CORS_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=config.PORT, reload=True)

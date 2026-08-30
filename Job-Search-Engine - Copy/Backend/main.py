from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Backend.api.routes import router


# --------------------------------------------------
# Create FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="Job Search AI Agent",
    description="AI-powered Resume Assistant",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://10.168.162.33:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# --------------------------------------------------
# Routes
# --------------------------------------------------

app.include_router(router)


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@app.get("/")
async def root():

    return {
        "message": "Job Search AI Agent API is running 🚀"
    }
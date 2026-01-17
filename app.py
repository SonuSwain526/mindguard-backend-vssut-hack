from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib

from model.embedding import get_embedding
from rules.rule_engine import get_suggestion

# ----------------- Load Model -----------------
classifier = joblib.load("model/stress_classifier.pkl")
label_encoder = joblib.load("model/label_encoder.pkl")

# ----------------- App -----------------
app = FastAPI(title="MindGuard API")

# ----------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # OK for hackathon
    allow_credentials=True,
    allow_methods=["*"],          # POST, GET, OPTIONS
    allow_headers=["*"],
)

# ----------------- Request Schema -----------------
class StressRequest(BaseModel):
    text: str
    sleep_hours: float | None = None
    screen_time: float | None = None

# ----------------- Response Schema -----------------
class StressResponse(BaseModel):
    stress_level: str
    suggestion: str

# ----------------- API Endpoint -----------------
@app.post("/predict", response_model=StressResponse)
def predict_stress(data: StressRequest):

    # 1. Text → Embedding
    embedding = get_embedding([data.text])

    # 2. Classifier prediction
    pred = classifier.predict(embedding)[0]
    label = label_encoder.inverse_transform([pred])[0]

    # 3. Rule-based suggestion
    suggestion = get_suggestion(
        label=label,
        sleep_hours=data.sleep_hours,
        screen_time=data.screen_time
    )

    return {
        "stress_level": label,
        "suggestion": suggestion
    }

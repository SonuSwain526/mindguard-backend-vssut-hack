import os
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from model.embedding import get_embedding

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI (Set your key in environment variables or replace here)
client = OpenAI(api_key="OPENAI_API_KEY")

# Load your custom-trained models
classifier = joblib.load("model/stress_classifier.pkl")
label_encoder = joblib.load("model/label_encoder.pkl")

app = FastAPI(title="MindGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StressRequest(BaseModel):
    text: str
    sleep_hours: float | None = None
    screen_time: float | None = None

@app.post("/predict")
async def predict_stress(data: StressRequest):
    # 1. Local Inference using your custom model
    embedding = get_embedding([data.text])
    pred = classifier.predict(embedding)[0]
    label = label_encoder.inverse_transform([pred])[0] # Returns "Low", "Moderate", or "High"

    # 2. Generative Suggestion via OpenAI
    prompt = (
        f"The student is experiencing {label} stress. "
        f"Statement: '{data.text}'. "
        f"Context: {data.sleep_hours}h sleep, {data.screen_time}h screen time. "
        "Provide a futuristic, supportive, 2-line suggestion as MindGuard OS."
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are MindGuard OS, a calm neo-cyberpunk wellness AI."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=80
    )
    
    suggestion = response.choices[0].message.content

    return {
        "stress_level": label,
        "suggestion": suggestion
    }
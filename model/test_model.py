import joblib
from model.embedding import get_embedding

# Load saved classifier and label encoder
clf = joblib.load("model/stress_classifier.pkl")
le = joblib.load("model/label_encoder.pkl")

def predict_stress(text: str):
    # Convert input text to embedding
    embedding = get_embedding([text])  # shape (1, 768)

    # Predict class
    pred = clf.predict(embedding)[0]

    # Convert numeric label back to text
    label = le.inverse_transform([pred])[0]

    return label


# ----------- TEST CASES -----------
examples = [
    "I feel calm and focused while studying.",
    "I am very stressed about exams and deadlines.",
    "I can’t sleep properly and feel anxious all day.",
    "Everything feels hopeless and I don’t want to continue.",
]

for text in examples:
    result = predict_stress(text)
    print(f"\nInput: {text}")
    print(f"Predicted Stress Level: {result}")

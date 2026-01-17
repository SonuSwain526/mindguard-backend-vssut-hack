from transformers import DistilBertTokenizer, DistilBertModel
import torch

# Load tokenizer and model (auto-downloads from Hugging Face)
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
model = DistilBertModel.from_pretrained("distilbert-base-uncased")

# Set to evaluation modeṇ
model.eval()

def get_embedding(text):
    # Tokenize input text
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    # Disable gradient calculation (faster)
    with torch.no_grad():
        outputs = model(**inputs)

    # Get sentence embedding (mean pooling)
    embeddings = outputs.last_hidden_state.mean(dim=1)

    return embeddings.numpy()

# text = "I have exams next week and I feel stressed"
# embedding = get_embedding(text)

# print(embedding)

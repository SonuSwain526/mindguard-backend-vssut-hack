import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
from model.embedding import get_embedding

#train tsest split

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "data.csv")

df = pd.read_csv(DATA_PATH)


allowed_label = [
    "Normal",
    "Stress",
    "Anxiety",
    "Depression",
    "Suicidal",
    ]

df = df[df["status"].isin(allowed_label)]

# Remove rows where text is NaN
df = df.dropna(subset=["statement"])

# Remove rows where text is empty or only spaces
df = df[df["statement"].str.strip() != ""]


df = (
    df.groupby("status", group_keys=False)
      .apply(lambda x: x.sample(min(len(x), 600), random_state=42))
)

print(df["status"].value_counts())


label_mapping = {
    "Normal": "Low",
    "Stress": "Moderate",
    "Anxiety": "Moderate",
    "Depression": "High",
    "Suicidal": "High"
}


# Apply mapping
df["stress_level"] = df["status"].map(label_mapping)
df = df.dropna(subset=["stress_level"])



statement_list = df["statement"].to_list()

x = []

for text in statement_list:
    embed = get_embedding(text)
    x.append(embed[0])

x = np.array(x)


encoder = LabelEncoder()
y = encoder.fit_transform(df["status"])




X_train, X_test, y_train, y_test = train_test_split(
    x, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


clf = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
print(classification_report(y_test, y_pred, target_names=encoder.classes_))


joblib.dump(clf, "model/stress_classifier.pkl")
joblib.dump(encoder, "model/label_encoder.pkl")

print("x is this",x)
# df["statement"] = df["statement"].replace(get_embedding(df["statement"]))



# print("Final dataset size:", len(df))
# print(df["stress_level"].value_counts())
print(df.head())





# x_train, y_train, x_test, y_test = train_test_split(df, test_size=0.2, random_state=42, )
# print(x_test)
# evaluate.py
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datasets import load_dataset
from tqdm import tqdm
import sys

from finetune import FoodClassifier, device, val_transform, Food101Dataset

@torch.no_grad()
def evaluate_model(model, loader):
    model.eval()
    all_preds = []
    all_labels = []

    for images, labels in tqdm(loader, desc="Evaluating"):
        images = images.to(device)
        outputs = model(images)
        preds = outputs.argmax(dim=1)
        
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.numpy())

    return np.array(all_labels), np.array(all_preds)


if __name__ == "__main__":
    # Recreate val_loader as it's not directly importable from finetune.py
    print("Loading Food101 dataset for evaluation...")
    dataset = load_dataset("food101", trust_remote_code=True)
    split = dataset["train"].train_test_split(test_size=0.1, seed=42)
    
    val_ds   = Food101Dataset(split['test'], transform=val_transform)
    val_loader = DataLoader(val_ds, batch_size=20, shuffle=False,
                           num_workers=2, pin_memory=True)
    print(f"Validation dataset size: {len(val_ds)}")

    model = FoodClassifier().to(device)
    checkpoint = torch.load("models/best_food101_b4.pt", map_location=device)
    model.load_state_dict(checkpoint["model_state"])
    class_names = checkpoint["class_names"]

    print("Starting full evaluation...")
    true_labels, predictions = evaluate_model(model, val_loader)

    print("\n=== Classification Report ===")
    print(classification_report(true_labels, predictions, target_names=class_names, digits=4))

    # Confusion Matrix
    cm = confusion_matrix(true_labels, predictions)
    plt.figure(figsize=(20, 20))
    sns.heatmap(cm, annot=False, cmap='Blues')
    plt.title("Confusion Matrix")
    plt.savefig("confusion_matrix.png")
    print("Confusion matrix saved as confusion_matrix.png")
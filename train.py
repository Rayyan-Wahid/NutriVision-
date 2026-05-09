import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms
from datasets import load_dataset
import timm
from tqdm import tqdm
import os

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# ====================== Transforms ======================
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(380),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize(400),
    transforms.CenterCrop(380),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


class Food101Dataset(torch.utils.data.Dataset):
    def __init__(self, hf_dataset, transform=None):
        self.dataset = hf_dataset
        self.transform = transform

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        item = self.dataset[idx]
        image = item['image'].convert("RGB")
        label = item['label']
        
        if self.transform:
            image = self.transform(image)
        
        return image, label


if __name__ == "__main__":
    print("Loading Food101 dataset...")
    dataset = load_dataset("food101", trust_remote_code=True)
    
    split = dataset["train"].train_test_split(test_size=0.1, seed=42)

    train_ds = Food101Dataset(split['train'], transform=train_transform)
    val_ds   = Food101Dataset(split['test'],  transform=val_transform)

    # DataLoaders
    train_loader = DataLoader(
        train_ds,
        batch_size=16,
        shuffle=True,
        num_workers=4,
        pin_memory=True,
        persistent_workers=True
    )

    val_loader = DataLoader(
        val_ds,
        batch_size=16,
        shuffle=False,
        num_workers=2,
        pin_memory=True
    )

    # ====================== Model ======================
    class FoodClassifier(nn.Module):
        def __init__(self, num_classes=101):
            super().__init__()
            self.backbone = timm.create_model('efficientnet_b4', pretrained=True, num_classes=0)
            in_features = self.backbone.num_features
            
            self.head = nn.Sequential(
                nn.Dropout(0.4),
                nn.Linear(in_features, 512),
                nn.ReLU(inplace=True),
                nn.Dropout(0.2),
                nn.Linear(512, num_classes)
            )

        def forward(self, x):
            x = self.backbone(x)
            return self.head(x)

    model = FoodClassifier().to(device)

    # Freeze backbone for Phase 1
    for param in model.backbone.parameters():
        param.requires_grad = False

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(model.head.parameters(), lr=1e-3, weight_decay=1e-4)

    # ====================== Training Functions ======================
    def train_epoch(model, loader):
        model.train()
        total_loss = 0
        correct = 0
        total = 0

        for images, labels in tqdm(loader, desc="Training"):
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        return total_loss / len(loader), correct / total


    def validate(model, loader):
        model.eval()
        total_loss = 0
        correct = 0
        total = 0

        with torch.no_grad():
            for images, labels in tqdm(loader, desc="Validating"):
                images = images.to(device)
                labels = labels.to(device)

                outputs = model(images)
                loss = criterion(outputs, labels)

                total_loss += loss.item()
                preds = outputs.argmax(dim=1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)

        return total_loss / len(loader), correct / total


    # ====================== Training ======================
    print("Starting training...\n")
    for epoch in range(5):
        train_loss, train_acc = train_epoch(model, train_loader)
        val_loss, val_acc = validate(model, val_loader)

        print(f"Epoch {epoch+1}/5")
        print(f"Train Loss: {train_loss:.4f} | Acc: {train_acc:.4f}")
        print(f"Val Loss:   {val_loss:.4f}   | Acc: {val_acc:.4f}")
        print("-" * 60)
        
    # Save the progress from Phase 1
    os.makedirs("models", exist_ok=True)
    torch.save({
        "model_state": model.state_dict(),
        "class_names": dataset["train"].features["label"].names
    }, "models/phase1_head_only.pt")
    print("--- PHASE 1 SAVED SUCCESSFULLY ---")

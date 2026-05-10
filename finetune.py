import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import transforms
from datasets import load_dataset
import timm
from tqdm import tqdm
import os
from torch.optim.lr_scheduler import CosineAnnealingLR
from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

if __name__ == "__main__":
    print(f"Using device: {device}")

# ====================== Transforms & Dataset ====================== epochs = 1 to 19
# train_transform = transforms.Compose([
#     transforms.RandomResizedCrop(380),
#     transforms.RandomHorizontalFlip(),
#     transforms.RandomRotation(15),
#     transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
#     transforms.ToTensor(),
#     transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
# ])

#epochs = 20 to 21
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(380, scale=(0.75, 1.0)),   # Less aggressive
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(10),                         # Reduced
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),  # Reduced
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

# ====================== Model Definition ======================
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


# ====================== TRAINING FUNCTIONS ======================
def train_epoch(model, loader, optimizer, criterion, scaler):
    model.train()
    total_loss = 0
    correct = 0
    total = 0

    for images, labels in tqdm(loader, desc="Training", leave=False):
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()

        # Runs the forward pass with autocasting
        with torch.cuda.amp.autocast():
            outputs = model(images)
            loss = criterion(outputs, labels)

        # Scales loss, calls backward(), and unscales gradients for the optimizer
        scaler.scale(loss).backward()

        # scaler.step() first unscales the gradients of the optimizer's assigned params.
        # If these gradients do not contain infs or NaNs, optimizer.step() is then called,
        # otherwise, optimizer.step() is skipped.
        scaler.step(optimizer)

        # Updates the scale for next iteration
        scaler.update()

        total_loss += loss.item()
        correct += (outputs.argmax(1) == labels).sum().item()
        total += labels.size(0)

    return total_loss / len(loader), correct / total


def validate(model, loader, criterion):
    model.eval()
    total_loss = 0
    correct = 0
    total = 0

    # We also use autocast during validation for speed and consistency
    with torch.no_grad():
        with torch.cuda.amp.autocast():
            for images, labels in tqdm(loader, desc="Validating", leave=False):
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                total_loss += loss.item()
                correct += (outputs.argmax(1) == labels).sum().item()
                total += labels.size(0)

    return total_loss / len(loader), correct / total

# ====================== TRAINING LOOP ======================
if __name__ == "__main__":
    # ====================== Load Dataset ======================
    print("Loading Food101 dataset...")
    dataset = load_dataset("food101", trust_remote_code=True)
    split = dataset["train"].train_test_split(test_size=0.1, seed=42)

    train_ds = Food101Dataset(split['train'], transform=train_transform)
    val_ds   = Food101Dataset(split['test'], transform=val_transform)

    train_loader = DataLoader(
        train_ds,
        batch_size=16,
        shuffle=True,
        num_workers=4,
        pin_memory=True,
        drop_last=True,
        persistent_workers=True
    )

    val_loader = DataLoader(val_ds, batch_size=20, shuffle=False,
                           num_workers=2, pin_memory=True)

    print(f"Train: {len(train_ds)} | Val: {len(val_ds)}")

    model = FoodClassifier().to(device)

    print("Loading checkpoint")
    checkpoint = torch.load("models/best_food101_b4.pt", map_location=device)
    model.load_state_dict(checkpoint["model_state"], strict=False)
    class_names = checkpoint["class_names"]
    model.load_state_dict(checkpoint["model_state"])
    start_epoch = checkpoint["epoch"] + 1
    best_val_acc = checkpoint["best_val_acc"]
    print(f"Successfully resumed from Epoch {start_epoch}")
    print(f"Best Val Acc so far: {best_val_acc:.4f}")

    # ====================== PHASE 2: Full Fine-tuning ======================

    # Unfreeze all layers
    for param in model.parameters():
        param.requires_grad = True

    print("Model fully unfrozen for fine-tuning")

    optimizer = optim.AdamW([
        {'params': model.backbone.parameters(), 'lr': 3e-6},
        {'params': model.head.parameters(),     'lr': 2e-5}
    ], weight_decay=1e-4)

    scheduler = CosineAnnealingLR(optimizer, T_max=20)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

    # Early Stopping
    best_val_acc = 0.0
    patience = 5
    counter = 0

    # Initialize the GradScaler once outside the loop
    scaler = torch.amp.GradScaler('cuda')

    total_epochs = 23
    print(f"Starting Phase 2 Fine-tuning (Target: {total_epochs} epochs)...\n")

    for epoch in range(start_epoch, total_epochs):
        # Pass the scaler for AMP support
        train_loss, train_acc = train_epoch(model, train_loader, optimizer, criterion, scaler)
        val_loss, val_acc = validate(model, val_loader, criterion)

        # Step the scheduler
        scheduler.step()

        print(f"Epoch {epoch+1:2d}/{total_epochs} | Train Acc: {train_acc:.4f} | Val Acc: {val_acc:.4f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            counter = 0
            save_status = "→ New Best! Saved to Drive."
        else:
            counter += 1
            save_status = f"→ No improvement ({counter}/{patience})"

        # 3. Always save the state after each epoch so we can resume if Colab crashes
        torch.save({
            "epoch": epoch,
            "model_state": model.state_dict(),
            "optimizer_state": optimizer.state_dict(),
            "scheduler_state": scheduler.state_dict(), # Crucial for CosineAnnealing
            "best_val_acc": best_val_acc,
            "class_names": class_names
        }, "models/best_food101_b4.pt")

        print(f"   {save_status}")

        if counter >= patience:
            print("Early stopping triggered!")
            break

    print(f"\n🎉 Phase 2 Progress Updated! Best Validation Accuracy: {best_val_acc:.4f}")
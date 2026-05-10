# vision.py
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import timm
import os

class FoodClassifier(nn.Module):
    def __init__(self, num_classes=101):
        super().__init__()
        self.backbone = timm.create_model('efficientnet_b4', pretrained=False, num_classes=0)
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


class NutriVision:
    def __init__(self, checkpoint_path="models/best_food101_b4.pt"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = FoodClassifier().to(self.device)
        
        if not os.path.exists(checkpoint_path):
            raise FileNotFoundError(f"Model not found: {checkpoint_path}")
            
        checkpoint = torch.load(checkpoint_path, map_location=self.device)
        self.model.load_state_dict(checkpoint["model_state"])
        self.class_names = checkpoint["class_names"]
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize(400),
            transforms.CenterCrop(380),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        print(f"✅ NutriVision loaded on {self.device} with {len(self.class_names)} classes.")

    def predict(self, image_path, top_k=3):
        image = Image.open(image_path).convert("RGB")
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            output = self.model(input_tensor)
            probs = torch.nn.functional.softmax(output[0], dim=0)
            top_prob, top_idx = torch.topk(probs, top_k)

        results = []
        for i in range(top_k):
            idx = top_idx[i].item()
            results.append({
                "food": self.class_names[idx].replace("_", " ").title(),
                "confidence": float(top_prob[i].item())
            })
        return results


# Singleton instance
nutrivision = None

def get_nutrivision():
    global nutrivision
    if nutrivision is None:
        nutrivision = NutriVision()
    return nutrivision
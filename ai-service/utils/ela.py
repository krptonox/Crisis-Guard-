import cv2
import numpy as np
from typing import Dict, Any

class ErrorLevelAnalysis:
    """Error Level Analysis for detecting image manipulation"""
    
    def __init__(self, quality: int = 90):
        self.quality = quality
    
    def analyze(self, image_path: str) -> Dict[str, Any]:
        """Perform ELA on image"""
        # Read original image
        original = cv2.imread(image_path)
        
        # Save as JPEG with specified quality
        temp_path = "temp_ela.jpg"
        cv2.imwrite(temp_path, original, [cv2.IMWRITE_JPEG_QUALITY, self.quality])
        
        # Read compressed image
        compressed = cv2.imread(temp_path)
        
        # Calculate difference
        diff = cv2.absdiff(original, compressed)
        diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        
        # Calculate score
        score = np.mean(diff_gray)
        
        # Cleanup
        import os
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return {
            "score": float(score),
            "is_manipulated": score > 15,
            "heatmap": diff_gray if score > 10 else None
        }
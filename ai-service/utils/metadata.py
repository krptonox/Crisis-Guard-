import os
from datetime import datetime
from typing import Dict, Any, List
import hashlib

class MetadataExtractor:
    """Extract and analyze file metadata"""
    
    def __init__(self):
        pass
    
    def extract(self, file_path: str) -> Dict[str, Any]:
        """Extract metadata from file"""
        result = {
            "file_size": os.path.getsize(file_path),
            "modified_time": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
            "created_time": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat(),
            "warnings": []
        }
        
        # Check for timestamp inconsistencies
        if abs(os.path.getmtime(file_path) - os.path.getctime(file_path)) < 1:
            result["warnings"].append("File creation and modification times are nearly identical")
        
        # Check file extension vs content (basic)
        ext = os.path.splitext(file_path)[1].lower()
        with open(file_path, 'rb') as f:
            header = f.read(8)
        
        # PDF check
        if ext == '.pdf' and header[:4] != b'%PDF':
            result["warnings"].append("PDF header mismatch - possible tampering")
        
        # Image header checks
        if ext in ['.jpg', '.jpeg'] and header[:2] != b'\xff\xd8':
            result["warnings"].append("JPEG header missing - possible manipulation")
        
        if ext == '.png' and header[:8] != b'\x89PNG\r\n\x1a\n':
            result["warnings"].append("PNG header missing - possible manipulation")
        
        return result
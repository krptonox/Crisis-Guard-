import cv2
import numpy as np
from typing import List, Tuple, Dict, Any

class VideoProcessor:
    """Video processing utilities"""
    
    def __init__(self):
        pass
    
    def extract_frames(self, video_path: str, max_frames: int = 30) -> List[np.ndarray]:
        """Extract frames from video"""
        frames = []
        cap = cv2.VideoCapture(video_path)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if frame_count > 0:
            step = max(1, frame_count // max_frames)
            for i in range(0, min(frame_count, max_frames * step), step):
                cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                ret, frame = cap.read()
                if ret:
                    frames.append(frame)
        
        cap.release()
        return frames
    
    def get_video_info(self, video_path: str) -> Dict[str, Any]:
        """Get video metadata"""
        cap = cv2.VideoCapture(video_path)
        info = {
            "frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            "fps": cap.get(cv2.CAP_PROP_FPS),
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            "duration": 0
        }
        if info["fps"] > 0:
            info["duration"] = info["frame_count"] / info["fps"]
        cap.release()
        return info
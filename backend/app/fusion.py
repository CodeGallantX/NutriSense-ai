"""
Fusion Logic Module
Combines YOLO and DeepSeek detection results
YOLO is the trusted anchor; DeepSeek fills gaps
"""
import logging
from typing import List, Dict, Any, Set

logger = logging.getLogger(__name__)


class DetectionFusion:
    
    def __init__(
        self,
        deepseek_confidence_threshold: float = 0.3,
        similarity_threshold: float = 0.8
    ):
        self.deepseek_threshold = deepseek_confidence_threshold
        self.similarity_threshold = similarity_threshold
    
    def fuse(
        self,
        yolo_results: List[Dict[str, Any]],
        deepseek_results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        
        logger.info(f"Fusing results: {len(yolo_results)} YOLO + {len(deepseek_results)} DeepSeek")
        
        # Step 1: Keep all YOLO results (trusted anchor)
        fused_results = []
        yolo_names = set()
        
        for item in yolo_results:
            fused_results.append(item)
            yolo_names.add(self._normalize_name(item['name']))
        
        logger.info(f"YOLO anchor items: {sorted(yolo_names)}")
        
        # Step 2: Filter DeepSeek results
        deepseek_filtered = [
            item for item in deepseek_results
            if item['confidence'] >= self.deepseek_threshold
        ]
        
        # Step 3: Add DeepSeek items not in YOLO results
        added_count = 0
        for item in deepseek_filtered:
            normalized_name = self._normalize_name(item['name'])
            
            # Check if already detected by YOLO
            if not self._is_duplicate(normalized_name, yolo_names):
                fused_results.append(item)
                yolo_names.add(normalized_name)
                added_count += 1
                logger.info(f"Added from DeepSeek: {item['name']} (conf={item['confidence']:.2f})")
        
        logger.info(f"Fusion complete: {len(fused_results)} total items ({added_count} added from DeepSeek)")
        
        # Step 4: Sort by confidence (optional, for presentation)
        fused_results.sort(key=lambda x: x['confidence'], reverse=True)
        
        return fused_results
    
    def _normalize_name(self, name: str) -> str:
        """
        Normalize food name for comparison.
        
        Args:
            name: Raw food name
            
        Returns:
            Normalized name (lowercase, trimmed)
        """
        return name.strip().lower()
    
    def _is_duplicate(self, name: str, existing_names: Set[str]) -> bool:
        """
        Check if name is duplicate of existing names.
        
        Uses exact matching and partial matching for common variations.
        
        Args:
            name: Normalized food name to check
            existing_names: Set of existing normalized names
            
        Returns:
            True if duplicate, False otherwise
        """
        # Exact match
        if name in existing_names:
            return True
        
        # Check for partial matches (e.g., "fried rice" vs "rice")
        name_tokens = set(name.split())
        
        for existing in existing_names:
            existing_tokens = set(existing.split())
            
            # Check overlap
            overlap = name_tokens & existing_tokens
            
            # If significant overlap, consider duplicate
            if len(overlap) > 0:
                # Calculate Jaccard similarity
                similarity = len(overlap) / len(name_tokens | existing_tokens)
                
                if similarity >= self.similarity_threshold:
                    logger.debug(f"Duplicate detected: '{name}' ~ '{existing}' (similarity={similarity:.2f})")
                    return True
        
        return False
    
    def get_statistics(self, fused_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get statistics about fused results.
        
        Args:
            fused_results: List of fused detection results
            
        Returns:
            Dictionary with statistics
        """
        yolo_count = sum(1 for item in fused_results if item['source'] == 'yolo')
        deepseek_count = sum(1 for item in fused_results if item['source'] == 'deepseek')
        
        avg_confidence = sum(item['confidence'] for item in fused_results) / len(fused_results) if fused_results else 0
        
        return {
            "total_items": len(fused_results),
            "yolo_items": yolo_count,
            "deepseek_items": deepseek_count,
            "average_confidence": round(avg_confidence, 3),
            "items": [item['name'] for item in fused_results]
        }

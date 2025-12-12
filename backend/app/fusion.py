import logging
from typing import List, Dict, Any, Set

logger = logging.getLogger(__name__)


class DetectionFusion:
    
    def __init__(
        self,
        llm_confidence_threshold: float = 0.3,
        similarity_threshold: float = 0.8
    ):
        self.llm_threshold = llm_confidence_threshold
        self.similarity_threshold = similarity_threshold
    
    def fuse(
        self,
        yolo_results: List[Dict[str, Any]],
        llm_results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        
        logger.info(f"Fusing results: {len(yolo_results)} YOLO + {len(llm_results)} LLM")
        
        # Step 1: Filter LLM results by confidence threshold
        llm_filtered = [
            item for item in llm_results
            if item.get('confidence', 0) >= self.llm_threshold
        ]
        logger.info(f"LLM items meeting threshold ({self.llm_threshold}): {len(llm_filtered)}")
        
        # Step 2: Build name-to-item mapping for conflict resolution
        fused_map = {}  # normalized_name -> item
        
        # Add YOLO results first (baseline)
        for item in yolo_results:
            normalized_name = self._normalize_name(item['name'])
            fused_map[normalized_name] = item
        
        logger.info(f"YOLO anchor items: {sorted(fused_map.keys())}")
        
        # Step 3: Process LLM results
        # For duplicates: keep higher confidence
        # For new items: add to fused map
        added_count = 0
        updated_count = 0
        
        for llm_item in llm_filtered:
            normalized_name = self._normalize_name(llm_item['name'])
            
            # Check if this food already exists in fused results
            if normalized_name in fused_map:
                # Duplicate found - keep higher confidence
                existing_item = fused_map[normalized_name]
                if llm_item['confidence'] > existing_item['confidence']:
                    fused_map[normalized_name] = llm_item
                    updated_count += 1
                    logger.info(
                        f"Updated '{llm_item['name']}': LLM conf={llm_item['confidence']:.2f} "
                        f"> YOLO conf={existing_item['confidence']:.2f}"
                    )
            else:
                # New item - check for partial duplicates
                is_duplicate = self._is_duplicate(normalized_name, set(fused_map.keys()))
                
                if not is_duplicate:
                    fused_map[normalized_name] = llm_item
                    added_count += 1
                    logger.info(f"Added from LLM: {llm_item['name']} (conf={llm_item['confidence']:.2f})")
                else:
                    logger.debug(f"Skipped LLM item '{llm_item['name']}' - similar to existing food")
        
        logger.info(
            f"Fusion complete: {len(fused_map)} total items "
            f"({updated_count} updated, {added_count} added from LLM)"
        )
        
        # Step 4: Convert to list and sort by confidence
        fused_results = list(fused_map.values())
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
        yolo_count = sum(1 for item in fused_results if item.get('source', '').lower() == 'yolo')
        llm_count = sum(1 for item in fused_results if item.get('source', '').lower() == 'llm')
        
        avg_confidence = sum(item['confidence'] for item in fused_results) / len(fused_results) if fused_results else 0
        
        return {
            "total_items": len(fused_results),
            "yolo_items": yolo_count,
            "llm_items": llm_count,
            "average_confidence": round(avg_confidence, 3),
            "items": [item['name'] for item in fused_results]
        }

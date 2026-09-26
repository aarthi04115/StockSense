def detect_anomaly(adjustment_data: dict):
    """
    Evaluates a stock adjustment for potential anomalies (e.g., shrinkage or repetitive loss).
    Returns an anomaly score between 0.0 and 1.0.
    """
    delta = adjustment_data.get('delta', 0)
    reason = adjustment_data.get('reason', '')
    
    score = 0.0
    anomaly_reason = None
    
    # Simple heuristics for MVP
    if delta < -50:
        score += 0.6
        anomaly_reason = "Large negative adjustment"
        
    if "missing" in reason.lower() or "damage" in reason.lower():
        score += 0.3
        
    is_anomalous = score >= 0.7
    
    return {
        "is_anomalous": is_anomalous,
        "score": min(score, 1.0),
        "reason": anomaly_reason if is_anomalous else None
    }

def get_suggestion(label, sleep_hours=None, screen_time=None):
    # Match the updated stress levels: Low, Moderate, High
    if label == "High":
        return "High stress detected. Please reach out to someone you trust or take a complete digital break."

    if label == "Moderate":
        if sleep_hours is not None and sleep_hours < 6:
            return "Analysis suggests your anxiety is linked to sleep deprivation. Prioritize 7+ hours of rest tonight."
        return "Moderate stress detected. Consider taking short academic breaks and practicing mindfulness."

    # Default to Low
    if label == "Low":
        if screen_time is not None and screen_time > 8:
            return "Your current mood is stable, but high screen time is a risk factor for future stress."
    
    return "Stress level is low. Keep maintaining your current healthy routine."
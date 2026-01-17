def get_suggestion(label, sleep_hours=None, screen_time=None):

    if label in ["Depression", "Suicidal"]:
        return "High stress detected. Please reach out to someone you trust or take a break."

    if label in ["Stress", "Anxiety"]:
        if sleep_hours is not None and sleep_hours < 6:
            return "You seem stressed and sleep-deprived. Try resting and planning tasks."
        return "Moderate stress detected. Consider taking short breaks."

    return "Stress level is low. Keep maintaining a healthy routine."

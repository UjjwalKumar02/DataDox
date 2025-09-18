import os
import pandas as pd
from datetime import datetime
from app.config import DATASET_PATH, LOG_FILE


def log_message(message: str):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}\n")


def update_dataset(new_row: dict):
    """
    Update dataset with a new row only if the Resume + Job_Description pair does not already exist.
    """
    if os.path.exists(DATASET_PATH) and os.path.getsize(DATASET_PATH) > 0:
        df = pd.read_csv(DATASET_PATH)

        duplicate_exists = (
            (df["Resume"] == new_row["Resume"])
            & (df["Job_Description"] == new_row["Job_Description"])
        ).any()

        if duplicate_exists:
            log_message(
                f"Duplicate skipped -> {new_row['Resume']} | {new_row['Job_Description']}"
            )
            return False

        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

    else:
        df = pd.DataFrame([new_row])

    # Save updated dataset
    df.to_csv(DATASET_PATH, index=False)
    log_message(
        f"Dataset updated -> {new_row['Resume']} | {new_row['Job_Description']}"
    )

    return True

import os
import pandas as pd
from datetime import datetime
from app.config import DATASET_PATH, LOG_FILE


def log_message(message: str):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}\n")


def update_dataset(new_row: dict):
    if os.path.exists(DATASET_PATH) and os.path.getsize(DATASET_PATH) > 0:
        df = pd.read_csv(DATASET_PATH)
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    else:
        df = pd.DataFrame([new_row])

    df.to_csv(DATASET_PATH, index=False)
    log_message(
        f"Dataset updated -> {new_row['resume']} | {new_row['job_description']}"
    )

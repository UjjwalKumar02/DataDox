import os


# Paths
UPLOAD_DIR = "uploaded_files"
RESUME_DIR = os.path.join(UPLOAD_DIR, "resumes")
JD_DIR = os.path.join(UPLOAD_DIR, "job_descriptions")
DATASET_PATH = "dataset.csv"
LOG_FILE = "logs.txt"

# Create necessary directories
os.makedirs(RESUME_DIR, exist_ok=True)
os.makedirs(JD_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESUME_DIR, exist_ok=True)
os.makedirs(JD_DIR, exist_ok=True)
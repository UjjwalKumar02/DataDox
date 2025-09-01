import os
from sentence_transformers import SentenceTransformer
import spacy


# Paths
UPLOAD_DIR = "uploaded_files"
RESUME_DIR = os.path.join(UPLOAD_DIR, "resumes")
JD_DIR = os.path.join(UPLOAD_DIR, "job_descriptions")
DATASET_PATH = "dataset.csv"
LOG_FILE = "logs.txt"

# Create necessary directories
os.makedirs(RESUME_DIR, exist_ok=True)
os.makedirs(JD_DIR, exist_ok=True)

# Models
nlp = spacy.load("en_core_web_sm")
bert_model = SentenceTransformer("all-MiniLM-L6-v2")

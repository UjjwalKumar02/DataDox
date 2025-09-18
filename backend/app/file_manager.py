import os
import hashlib
from app.config import RESUME_DIR, JD_DIR
import re
import unicodedata


def get_file_hash(file_bytes: bytes) -> str:
    """Generate an MD5 hash for the given file bytes."""
    return hashlib.md5(file_bytes).hexdigest()


def get_next_file_number(folder: str, prefix: str) -> int:
    """Find the next incremental number for a new file."""
    existing_files = [
        f
        for f in os.listdir(folder)
        if f.startswith(prefix) and os.path.isfile(os.path.join(folder, f))
    ]

    # Extract existing numbers like resume_1.pdf → 1
    numbers = []
    for file in existing_files:
        try:
            numbers.append(int(file.replace(prefix + "_", "").split(".")[0]))
        except ValueError:
            continue

    return max(numbers, default=0) + 1


def normalize_text(text: str) -> str:
    """Normalize and clean text for consistent hashing."""
    text = unicodedata.normalize("NFKC", text)  # Unicode normalization
    text = text.strip()
    text = re.sub(r"\r\n?", "\n", text)  # Normalize all line endings to \n
    text = "\n".join(
        line.strip() for line in text.splitlines() if line.strip()
    )  # Remove empty lines & trim each line
    return text


def save_unique_file(
    file_bytes: bytes, file_name: str, folder: str, prefix: str
) -> str:
    """
    Save a file uniquely by checking duplicates and using incremental numbering.
    Returns the stored filename.
    """
    file_hash = get_file_hash(file_bytes)

    # Check for duplicate files based on content hash
    for existing_file in os.listdir(folder):
        existing_path = os.path.join(folder, existing_file)
        with open(existing_path, "rb") as f:
            if get_file_hash(f.read()) == file_hash:
                return existing_file  # Return existing name if duplicate

    # Generate short, readable, sequential filename
    ext = os.path.splitext(file_name)[1]
    next_number = get_next_file_number(folder, prefix)
    new_filename = f"{prefix}_{next_number}{ext}"

    # Save the file
    with open(os.path.join(folder, new_filename), "wb") as f:
        f.write(file_bytes)

    return new_filename


def save_text_as_unique_file(text: str, folder: str, prefix: str) -> str:
    normalized_text = normalize_text(text)
    text_bytes = normalized_text.encode("utf-8")
    file_hash = get_file_hash(text_bytes)

    # Check for duplicate text files
    for existing_file in os.listdir(folder):
        if existing_file.endswith(".txt"):
            existing_path = os.path.join(folder, existing_file)
            with open(existing_path, "r", encoding="utf-8") as f:
                existing_text = f.read()
                existing_normalized = normalize_text(existing_text)
                existing_hash = get_file_hash(existing_normalized.encode("utf-8"))
                if existing_hash == file_hash:
                    return existing_file  # Return existing name if duplicate

    # Generate sequential file name
    next_number = get_next_file_number(folder, prefix)
    new_filename = f"{prefix}_{next_number}.txt"

    with open(os.path.join(folder, new_filename), "w", encoding="utf-8") as f:
        f.write(normalized_text)

    return new_filename

import io
import os
import logging
import numpy as np
import pandas as pd
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.extraction import extract_text_from_pdf, extract_text_from_docx
from app.extraction import extract_skills
from app.similarity import (
    calculate_tfidf_similarity,
    calculate_jaccard_similarity,
    calculate_length_ratio,
)
from app.file_manager import save_unique_file, save_text_as_unique_file
from app.dataset_manager import update_dataset
from app.config import RESUME_DIR, JD_DIR, DATASET_PATH


# Logging setup
logging.basicConfig(filename="logs.txt", level=logging.INFO)

app = FastAPI(title="Resume-JD Matcher", version="2.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process")
async def process_resume_jd(
    resume: UploadFile = File(...),
    jd_file: Optional[UploadFile] = File(None),
    jd_text_input: Optional[str] = Form(None),
    category: str = Form(...),
    score: float = Form(...),
):

    if not jd_file and not jd_text_input:
        return {"error": "Either JD file or JD text must be provided."}

    # Read & save Resume
    resume_bytes = await resume.read()
    resume_filename = save_unique_file(
        resume_bytes, resume.filename, RESUME_DIR, "resume"
    )

    if resume.filename.lower().endswith(".pdf"):
        resume_text = extract_text_from_pdf(resume_bytes)
    else:
        resume_text = extract_text_from_docx(io.BytesIO(resume_bytes))

    # Read & save JD
    if jd_file:
        jd_bytes = await jd_file.read()
        jd_filename = save_unique_file(jd_bytes, jd_file.filename, JD_DIR, "jd")
        jd_text = (
            extract_text_from_pdf(jd_bytes)
            if jd_file.filename.lower().endswith(".pdf")
            else extract_text_from_docx(io.BytesIO(jd_bytes))
        )
    elif jd_text_input:
        jd_filename = save_text_as_unique_file(
            jd_text_input, JD_DIR, "jd"
        )  # Save as .txt
        jd_text = jd_text_input
    else:
        return {"error": "No JD input provided."}

    # Similarity calculations
    tfidf_score = calculate_tfidf_similarity(resume_text, jd_text)
    jaccard_score = calculate_jaccard_similarity(resume_text, jd_text)
    length_ratio = calculate_length_ratio(resume_text, jd_text)

    # Extract skills
    resume_skills_dict = extract_skills(resume_text)
    jd_skills_dict = extract_skills(jd_text)

    resume_skills = set(resume_skills_dict.keys())
    jd_skills = set(jd_skills_dict.keys())

    # Exact canonical skill match
    matched_skills = sorted(jd_skills & resume_skills)
    missing_skills = sorted(jd_skills - resume_skills)
    # Compare skills
    matched_details = {skill: resume_skills_dict[skill] for skill in matched_skills}
    missing_details = {skill: jd_skills_dict[skill] for skill in missing_skills}

    # Prepare dataset row
    new_row = {
        "Resume": resume_filename,
        "Job_Description": jd_filename,
        "Tfidf_Similarity": float(np.round(tfidf_score, 2)),
        "Jaccard_Similarity": float(np.round(jaccard_score, 2)),
        "Length_Ratio": float(length_ratio),
        "No_of_Matched_Skills": len(matched_skills),
        "No_of_Missing_Skills": len(missing_skills),
        "Category": category,
        "Score": score,
    }

    # Update dataset CSV
    update_dataset(new_row)

    # Final response
    return {
        "message": "Processed successfully",
        "data": {
            **new_row,
            "matched_skills": [
                {"skill": skill, "matched_as": alias}
                for skill, alias in matched_details.items()
            ],
            "missing_skills": [
                {"skill": skill, "expected_as": alias}
                for skill, alias in missing_details.items()
            ],
            "resume_skills": sorted(list(resume_skills)),
            "jd_skills": sorted(list(jd_skills)),
            "resume_text": resume_text,
            "jd_text": jd_text,
        },
    }


@app.get("/dataset")
def get_dataset():
    """Fetch the complete dataset"""
    if os.path.exists(DATASET_PATH) and os.path.getsize(DATASET_PATH) > 0:
        df = pd.read_csv(DATASET_PATH)
        return {"data": df.to_dict(orient="records")}
    return {"data": []}

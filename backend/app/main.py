import io
import numpy as np
import logging
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.extraction import (
    extract_text_from_pdf,
    extract_text_from_docx,
)
from app.extraction import extract_skills
from app.similarity import (
    calculate_tfidf_similarity,
    calculate_bert_similarity,
)
from app.file_manager import save_unique_file
from app.dataset_manager import update_dataset
from app.config import RESUME_DIR, JD_DIR

# Logging setup
logging.basicConfig(filename="logs.txt", level=logging.INFO)

app = FastAPI(title="Resume-JD Matcher", version="2.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process")
async def process_resume_jd(
    resume: UploadFile = File(...),
    jd_file: UploadFile = File(...),
    category: str = Form(...),
    score: float = Form(...),
):
    """
    Endpoint to:
    1. Upload Resume & JD
    2. Extract Text + Skills
    3. Compute TF-IDF + BERT Similarity
    4. Detect Matched & Missing Skills
    5. Update Dataset
    """

    logging.info(
        f"Received request -> Resume: {resume.filename}, JD: {jd_file.filename}, "
        f"Category: {category}, Score: {score}"
    )

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
    jd_bytes = await jd_file.read()
    jd_filename = save_unique_file(jd_bytes, jd_file.filename, JD_DIR, "jd")

    jd_text = (
        extract_text_from_pdf(jd_bytes)
        if jd_file.filename.lower().endswith(".pdf")
        else extract_text_from_docx(io.BytesIO(jd_bytes))
    )

    # Similarity calculations
    tfidf_score = calculate_tfidf_similarity(resume_text, jd_text)
    bert_score = calculate_bert_similarity(resume_text, jd_text)

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
        "resume": resume_filename,
        "job_description": jd_filename,
        "tfidf_similarity": float(np.round(tfidf_score, 2)),
        "bert_similarity": float(np.round(bert_score, 2)),
        "num_matched_skills": len(matched_skills),
        "num_missing_skills": len(missing_skills),
        "category": category,
        "score": score,
    }

    # Update dataset CSV
    update_dataset(new_row)

    # Final response
    # return {
    #     "message": "Processed successfully",
    #     "data": {
    #         **new_row,
    #         "matched_skills": matched_details.items(),
    #         "missing_skills": missing_details.items(),
    #         "resume_skills": resume_skills,
    #         "jd_skills": jd_skills,
    #         "resume_text": resume_text,
    #         "jd_text": jd_text,
    #     },
    # }

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

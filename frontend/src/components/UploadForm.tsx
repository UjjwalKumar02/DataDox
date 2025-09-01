import { useState } from "react";
import api from "../lib/api";

type UploadFormProps = {
  onUpload: () => void;
  resume: File | null;
  setResume: (file: File | null) => void;
  jd: File | null;
  setJd: (file: File | null) => void;
  onPreviewClick: () => void;
};

const UploadForm: React.FC<UploadFormProps> = ({
  onUpload,
  resume,
  setResume,
  jd,
  setJd,
  onPreviewClick
}) => {
  const [category, setCategory] = useState("");
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!resume || !jd || !category || !score) {
      alert("All fields are required!");
      return;
    }

    try {
      setLoading(true);

      // Prepare form data
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jd_file", jd); // CHANGED: Must match FastAPI param name
      formData.append("category", category);
      formData.append("score", score);

      // Use the new unified endpoint
      const res = await api.post("/process", formData, {
        headers: { "Content-Type": "multipart/form-data" }, // ✅ Fixed typo
      });

      // Save result & refresh parent
      setResult(res.data.data);
      onUpload();
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-fit mx-auto bg-black text-gray-300 rounded-md shadow-md md:px-14 px-9 py-10 border border-gray-600">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:gap-8 gap-12"
      >
        <h1 className="text-center md:text-3xl text-2xl md:mb-6 mb-2">
          Dataset Row Insertion
        </h1>

        {/* Resume Upload */}
        <div className="flex flex-col justify-between gap-2.5">
          <label htmlFor="resume" className="">
            Upload Resume:
          </label>
          <input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            className="bg-[#1e1e1f] p-3 border border-gray-800 rounded text-gray-300 text-sm"
          />
        </div>

        {/* JD Upload */}
        <div className="flex flex-col justify-between gap-2.5">
          <label htmlFor="jd" className="">
            Upload Job Description:
          </label>
          <input
            id="jd"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setJd(e.target.files?.[0] || null)}
            className="bg-[#1e1e1f] p-3 border border-gray-800 rounded text-gray-300 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (!resume || !jd) {
              alert("Please upload both resume and JD to preview.");
              return;
            }
            onPreviewClick();
          }}
          className="p-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
        >
          Preview Files
        </button>

        {/* Category Selector */}
        <div className="flex flex-col justify-between gap-2.5">
          <label htmlFor="category" className="">
            Choose your evaluation category:
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#1e1e1f] p-3 border border-gray-800 rounded text-gray-300 text-sm"
          >
            <option value="">-- Select --</option>
            <option value="poor">Poor match</option>
            <option value="below-average">Below Average match</option>
            <option value="average">Average/Decent match</option>
            <option value="solid">Solid/Good match</option>
            <option value="perfect">Perfect match</option>
          </select>
        </div>

        {/* Score Input */}
        <div className="flex flex-col justify-between gap-2.5">
          <label htmlFor="score" className="">
            Enter Score (out of 100):
          </label>
          <input
            id="score"
            type="number"
            placeholder="Score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="bg-[#1e1e1f] p-3 border border-gray-800 rounded text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`p-2 rounded text-gray-800 transition ${loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-[#e5e5e5] text-black hover:bg-gray-300"
            }`}
        >
          {loading ? "Processing..." : "Upload & Process"}
        </button>
      </form>

      {/* Display Results */}
      {result && (
        <div className="mt-6 p-4 border rounded bg-[#e5e5e5] text-gray-800 shadow">
          <h2 className="text-xl font-bold mb-2">Results:</h2>
          <p>
            <strong>TF-IDF Score:</strong> {result.tfidf_similarity}
          </p>
          <p>
            <strong>BERT Score:</strong> {result.bert_similarity}
          </p>
          <p>
            <strong>Matched Skills:</strong>{" "}
            {result.matched_skills?.length > 0
              ? result.matched_skills.map((s: any) => `${s.skill} (as "${s.matched_as}")`).join(",")
              : "None"}
          </p>
          <p>
            <strong>Missing Skills:</strong>{" "}
            {result.missing_skills?.length > 0
              ? result.missing_skills.map((s: any) => `${s.skill} (expected as '${s.expected_as}')`).join(", ")
              : "None"}
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;

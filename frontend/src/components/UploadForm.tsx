import { useRef, useState } from "react";
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
  const [jdText, setJdText] = useState("");

  const resultRef = useRef<HTMLDivElement | null>(null);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resume || (!jd && !jdText.trim()) || !category || !score) {
      alert("All fields are required!");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("category", category);
      formData.append("score", score);
      if (jd) {
        formData.append("jd_file", jd);
      } else {
        formData.append("jd_text_input", jdText);
      }

      const res = await api.post("/process", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data.data);
      onUpload();
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

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
        className="flex flex-col md:gap-7 gap-12"
      >
        <h1 className="text-center md:text-3xl text-2xl md:mb-5 mb-2">
          Dataset Row Insertion
        </h1>

        {/* Resume Upload */}
        <div className="flex flex-col justify-between gap-2">
          <label htmlFor="resume" className="">
            Upload Resume:
          </label>
          <input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            className="bg-[#1e1e1f] p-2.5 border border-gray-800 rounded text-gray-300 text-sm"
          />
        </div>

        {/* JD Upload */}
        <div className="flex flex-col justify-between gap-2">
          <label htmlFor="jd" className="">
            Upload Job Description:
          </label>
          <input
            id="jd"
            type="file"
            accept=".pdf,.doc,.docx"
            disabled={jdText.trim().length > 0}
            onChange={(e) => setJd(e.target.files?.[0] || null)}
            className="bg-[#1e1e1f] p-2.5 border border-gray-800 rounded text-gray-300 text-sm disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col justify-between gap-2">
          <label htmlFor="jdText" className="">
            Enter Job Description:
          </label>
          <textarea
            id="jdText"
            rows={5}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            disabled={jd !== null}
            placeholder="Enter job description text here..."
            className="bg-[#1e1e1f] p-2.5 border border-gray-800 rounded text-sm text-gray-300 disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (!resume || (!jd && !jdText.trim())) {
              alert("Please upload resume and either JD file or JD text to preview.");
              return;
            }
            onPreviewClick();
          }}
          className="p-2 rounded bg-[#e5e5e5] text-black hover:bg-gray-300 transition"
        >
          Preview Files
        </button>

        {/* Category Selector */}
        <div className="flex flex-col justify-between gap-2">
          <label htmlFor="category" className="">
            Choose your evaluation category:
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#1e1e1f] p-2.5 border border-gray-800 rounded text-gray-300 text-sm"
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
        <div className="flex flex-col justify-between gap-2">
          <label htmlFor="score" className="">
            Enter Score (out of 100):
          </label>
          <input
            id="score"
            type="number"
            placeholder="Score"
            value={score}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setScore(val);
                return;
              }
              // Allow only numbers between 0 and 100
              const num = Number(val);
              if (num >= 0 && num <= 100) {
                setScore(val);
              }
            }}
            className="bg-[#1e1e1f] p-2.5 border border-gray-800 rounded text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`p-2 rounded text-gray-800 transition ${loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-red-500 text-white hover:bg-red-700"
            }`}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {/* Display Results in Table */}
      {result && (
        <div ref={resultRef} className="mt-10 p-4 border border-gray-600 rounded bg-[#1e1e1f] text-gray-200">
          <h2 className="text-xl  mb-4 text-center">Inserted Row</h2>

          <div className="overflow-x-auto mt-6">
            <table className="w-full border-collapse border border-gray-700 rounded-lg shadow font-sans">
              <thead>
                <tr className="bg-gray-800 text-gray-200">
                  <th className="border border-gray-700 p-3 font-semibold">Resume</th>
                  <th className="border border-gray-700 p-3 font-semibold">Job Description</th>
                  <th className="border border-gray-700 p-3 font-semibold">TF-IDF Similarity</th>
                  <th className="border border-gray-700 p-3 font-semibold">Jaccard Similarity</th>
                  <th className="border border-gray-700 p-3 font-semibold">Length Ratio</th>
                  <th className="border border-gray-700 p-3 font-semibold">No of Matched Skills</th>
                  <th className="border border-gray-700 p-3 font-semibold">No of Missing Skills</th>
                  <th className="border border-gray-700 p-3 font-semibold">Category</th>
                  <th className="border border-gray-700 p-3 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-900 text-gray-200">
                  <td className="border border-gray-700 p-3">{result.Resume}</td>
                  <td className="border border-gray-700 p-3">{result.Job_Description}</td>
                  <td className="border border-gray-700 p-3">{result.Tfidf_Similarity}</td>
                  <td className="border border-gray-700 p-3">{result.Jaccard_Similarity}</td>
                  <td className="border border-gray-700 p-3">{result.Length_Ratio}</td>
                  <td className="border border-gray-700 p-3">{result.No_of_Matched_Skills}</td>
                  <td className="border border-gray-700 p-3">{result.No_of_Missing_Skills}</td>
                  <td className="border border-gray-700 p-3 capitalize">{result.Category}</td>
                  <td className="border border-gray-700 p-3">{result.Score}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-10 space-y-1">
            <p>
              <span className="font-semibold">Matched skills:</span> {result.matched_skills?.length > 0
                ? result.matched_skills.map((s: any) => s.skill).join(", ")
                : "None"}
            </p>
            <p>
              <span className="font-semibold">Missing skills:</span> {result.missing_skills?.length > 0
                ? result.missing_skills.map((s: any) => s.skill).join(", ")
                : "None"}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

export default UploadForm;

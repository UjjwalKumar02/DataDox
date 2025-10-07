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
  const [showJdText, setShowJdText] = useState(false);

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
    <div className=" h-fit mx-auto bg-white text-gray-700 rounded-xl shadow-xl md:px-13 px-8 py-10 border border-gray-300">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:gap-4 gap-8"
      >
        <h1 className="text-center md:text-2xl text-2xl md:mb-2 mb-2 font-medium text-black">
          Insert Data
        </h1>

        {/* Resume Upload */}
        <div className="flex flex-col justify-between gap-2">
          <label htmlFor="resume" className="text-black">
            Resume:
          </label>
          <input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            className="bg-blue-50 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
        </div>

        {!showJdText ? (
          <div className="flex flex-col justify-between gap-2">
            <label htmlFor="jd" className="text-black">
              Job Description:
            </label>
            <input
              id="jd"
              type="file"
              accept=".pdf,.doc,.docx"
              disabled={jdText.trim().length > 0}
              onChange={(e) => setJd(e.target.files?.[0] || null)}
              className="bg-blue-50 px-2 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50"
            />
          </div>
        ) : (
          <div className="flex flex-col justify-between gap-2">
            <label htmlFor="jdText" className="text-black">
              Job Description:
            </label>
            <textarea
              id="jdText"
              rows={1}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              disabled={jd !== null}
              placeholder="Enter job description..."
              className="bg-blue-50 px-2 py-1.5 border border-gray-200 rounded-lg text-sm placeholder:text-gray-900 disabled:opacity-50"
            />
          </div>
        )}

        <p
          onClick={() => setShowJdText(!showJdText)}
          className="text-blue-600 cursor-pointer text-sm mt-1 w-fit">
          Enter JD in {showJdText ? "file" : "text"} format &gt;
        </p>


        <button
          type="button"
          onClick={() => {
            if (!resume || (!jd && !jdText.trim())) {
              alert("Please upload resume and either JD file or JD text to preview.");
              return;
            }
            onPreviewClick();
          }}
          className="py-0.5 px-11 rounded-lg bg-black text-white hover:bg-gray-800 font-medium transition w-fit mt- cursor-pointer"
        >
          Preview Files
        </button>


        <h1 className="text-2xl font-medium mt-3 text-black">
          Ratings:
        </h1>
        {/* Category Selector */}
        <div className="flex flex-col justify-between gap-2 mt-2">
          <label htmlFor="category" className="text-black">
            Category:
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-blue-50 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">-- Select --</option>
            <option value="poor">Poor match</option>
            <option value="below-average">Below Average match</option>
            <option value="average">Average match</option>
            <option value="solid">Solid match</option>
            <option value="perfect">Perfect match</option>
          </select>
        </div>

        {/* Score Input */}
        <div className="flex flex-col justify-between gap-2">
          <label htmlFor="score" className="text-black">
            Score:
          </label>
          <input
            id="score"
            type="number"
            placeholder="Enter score out of 100"
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
            className="bg-blue-50 px-2 py-1.5 border border-gray-200 rounded-lg text-sm placeholder:text-gray-800"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-fit py-0.5 px-11 rounded-lg text-gray-800 font-medium mt-1 transition ${loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-700 text-white hover:bg-blue-600"
            }`}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {/* Display Results in Table */}
      {result && (
        <div ref={resultRef} className="mt-10 p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-800">
          <h2 className="text-xl mb-4 text-center">Inserted Row</h2>

          <div className="overflow-x-auto mt-6">
            <table className="w-full border-collapse border border-gray-700 rounded-lg shadow font-sans">
              <thead>
                <tr className="bg-gray-300">
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
                <tr className="bg-gray-300">
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
              <span className="font-semibold">Matched skills:</span>
              {result.matched_skills?.length > 0
                ? result.matched_skills.map((s: any) => s.skill).join(", ")
                : "None"}
            </p>
            <p>
              <span className="font-semibold">Missing skills:</span>
              {result.missing_skills?.length > 0
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

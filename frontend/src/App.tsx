import { useState } from "react";
import UploadForm from "./components/UploadForm";
import FilePreview from "./components/FilePreview";

function App() {
  const [resume, setResume] = useState<File | null>(null);
  const [jd, setJd] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [refresh, setRefresh] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#1e1e1f] p-6"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-1/2">
          <UploadForm
            onUpload={() => setRefresh(!refresh)}
            resume={resume}
            setResume={setResume}
            jd={jd}
            setJd={setJd}
            onPreviewClick={() => setShowPreview(true)}
          />
        </div>
        {/* File Preview */}
        <div className="w-full lg:w-1/2 bg-black text-gray-300 py-10 px-7 rounded border border-gray-600 h-fit min-h-[500px]">
          <h2 className="text-2xl mb-4">
            Preview Uploaded Files
          </h2>

          {showPreview ? (
            <>
              <FilePreview file={resume} label="Resume Preview:" />
              <FilePreview file={jd} label="Job Description Preview:" />
            </>
          ) : (
            <div className="text-sm text-gray-300 italic">
              File previews will appear here after you click the{" "}
              <strong>"Preview Files"</strong> button.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

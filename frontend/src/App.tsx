import { useState } from "react";
import UploadForm from "./components/UploadForm";
import FilePreview from "./components/FilePreview";
import DatasetView from "./components/DatasetView";


function App() {
  const [resume, setResume] = useState<File | null>(null);
  const [jd, setJd] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showDataset, setShowDataset] = useState(false);


  return (
    <div
      className="min-h-screen p-4"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Navbar */}
      <div className=" flex justify-between items-center py-2 mb-1 lg:px-9 px-2">
        <h1 className="text-2xl font-semibold">
          DataDox
        </h1>
        <button
          onClick={() => setShowDataset(true)}
          className=" bg-blue-700 text-white rounded-lg hover:bg-blue-600 px-9 py-0.5 transition font-medium cursor-pointer"
        >
          View Dataset
        </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-22 items-start justify-center">
        {/* Upload Form */}
        <div className="w-full lg:max-w-[34%]">
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
        <div className="w-full lg:w-1/2 bg-white text-gray-900 py-9 px-7 rounded-xl border border-gray-300 h-fit min-h-[500px] shadow-xl">
          <h2 className="text-xl mb-5 font-medium">
            Preview Files
          </h2>

          {showPreview ? (
            <>
              <FilePreview file={resume} label="Resume" />
              <FilePreview file={jd} label="Job Description" />
            </>
          ) : (
            <div className="text-sm text-gray-900 italic">
              File previews will appear here after you click the{" "}
              <strong>"Preview Files"</strong> button.
            </div>
          )}
        </div>
      </div>

      {/* Full-screen Dataset Viewer */}
      {showDataset && <DatasetView onClose={() => setShowDataset(false)} />}
    </div>
  );
}

export default App;

import type React from "react";
import { useEffect, useState } from "react";


type FilePreviewProps = {
  file: File | null;
  label?: string;
};


const FilePreview: React.FC<FilePreviewProps> = ({ file, label }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Cleanup on unmount or file change
      return () => URL.revokeObjectURL(url)
    }
    else {
      setPreviewUrl(null);
    }
  }, [file]);

  if (!file) return null;

  const isPDF = file.type === "application/pdf";
  const isDoc = file.name.endsWith(".doc") || file.name.endsWith(".docx");


  return (
    <div className="mt-3">
      {label && <p className="text-sm text-gray-200">{label}</p>}

      <p className="text-sm text-gray-200 mb-2">
        File: {file.name}
      </p>

      {isPDF && previewUrl ? (
        <iframe
          src={previewUrl}
          width="100%"
          height="400px"
          className="border border-gray-600 rounded overflow-hidden"
          title="File Preview"
        />
      ) : isDoc ? (
        <p className="text-sm text-gray-500 italic">
          Preview not supported for Word files. Please download to view.
        </p>
      ) : (
        <p className="text-sm text-red-400 italic">
          File preview not supported.
        </p>
      )}
    </div>
  );
}

export default FilePreview
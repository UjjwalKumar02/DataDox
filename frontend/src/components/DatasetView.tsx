import { useEffect, useState } from "react";
import axios from "axios";
// import { X } from "lucide-react";

interface DatasetViewProps {
  onClose: () => void;
}

export default function DatasetView({ onClose }: DatasetViewProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const res = await axios.get("http://localhost:8000/dataset"); // Adjust URL if needed
        setData(res.data.data);
      } catch (error) {
        console.error("Error fetching dataset:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
        <h2 className="text-xl text-white">Dataset Viewer</h2>
        <button
          onClick={onClose}
          className="p-2 text-white hover:text-red-400 transition"
        >
          {/* <X size={24} className="text-white" /> */}
          Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <p className="text-gray-300 text-center">Loading dataset...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-center">No data found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-gray-200">
                  {Object.keys(data[0]).map((key, idx) => (
                    <th
                      key={idx}
                      className="border border-gray-700 p-3 text-left capitalize"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-700">
                    {Object.values(row).map((val : any, j) => (
                      <td
                        key={j}
                        className="border border-gray-700 p-3 text-gray-300"
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../lib/api";


interface DatasetViewProps {
  onClose: () => void;
}


export default function DatasetView({ onClose }: DatasetViewProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const res = await api.get("/dataset");
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

      <div className="flex justify-between items-center p-4 bg-blue-900 border-b border-gray-700">
        <h2 className="text-xl text-white font-medium">
          Dataset
        </h2>
        <button
          onClick={onClose}
          className="px-6 py-0.5 text-white hover:bg-red-500 transition font-medium bg-red-600 rounded-lg cursor-pointer"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <p className="text-gray-300 text-center">
            Loading dataset...
          </p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-center">No data found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-700">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-900 text-gray-200">
                  {Object.keys(data[0]).map((key, idx) => (
                    <th
                      key={idx}
                      className="border border-gray-700 p-3 text-left capitalize font-medium"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-900">
                    {Object.values(row).map((val: any, j) => (
                      <td
                        key={j}
                        className="border border-gray-700 p-3 text-gray-300 text-sm"
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

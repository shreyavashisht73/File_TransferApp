import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_BASE from "../api";
import { useNavigate } from "react-router-dom";

export default function RecentlyDeleted() {
const { user } = useAuth();
const [files, setFiles] = useState([]);
const navigate = useNavigate();

useEffect(() => {
if (user?.email) {
    axios
    .get(`${API_BASE}/files/deleted/${user.email}`)
    .then((res) => setFiles(res.data))
    .catch((err) => console.error("Error fetching deleted files:", err));
}
}, [user]);

const handleRestore = async (uuid) => {
try {
    await axios.patch(`${API_BASE}/files/restore/${uuid}`);
    setFiles((prev) => prev.filter((f) => f.uuid !== uuid));
    alert("File restored to My Files");
    navigate("/my-files");
} catch (err) {
    console.error(err);
    alert("Could not restore file");
}
};

const handlePermanentDelete = async (uuid) => {
try {
    await axios.delete(`${API_BASE}/files/permanent/${uuid}`);
    setFiles((prev) => prev.filter((f) => f.uuid !== uuid));
    alert("File permanently deleted");
} catch (err) {
    console.error(err);
    alert("Could not delete permanently");
}
};

return (
<div className="min-h-screen bg-gray-900 p-6 text-white">
    <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl font-bold">Recently Deleted</h2>
    <button
        onClick={() => navigate("/my-files")}
        className="text-sm underline text-indigo-300 hover:text-indigo-200"
    >
        ← Back to My Files
    </button>
    </div>

    {files.length > 0 ? (
    <div className="space-y-3">
        {files.map((file) => (
        <div key={file.uuid} className="bg-gray-800 p-4 rounded-lg flex justify-between">
            <div>
            <p className="font-semibold">{file.originalName}</p>
            <p className="text-gray-400 text-sm">
                Deleted at: {file.deletedAt ? new Date(file.deletedAt).toLocaleString() : "-"}
            </p>
            </div>
            <div className="flex gap-3 items-center">
            <button
                onClick={() => handleRestore(file.uuid)}
                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-green-300"
            >
                Restore
            </button>
            <button
                onClick={() => handlePermanentDelete(file.uuid)}
                className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white"
            >
                Delete Permanently
            </button>
            </div>
        </div>
        ))}
    </div>
    ) : (
    <p className="text-gray-400">No deleted files yet.</p>
    )}
</div>
);
}
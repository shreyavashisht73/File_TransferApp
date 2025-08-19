import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_BASE from "../api";
import { Link } from "react-router-dom";

export default function MyFiles() {
const { user } = useAuth();
const [files, setFiles] = useState([]);
const [openMenu, setOpenMenu] = useState(null);

useEffect(() => {
if (user?.email) {
    axios
    .get(`${API_BASE}/files/my-files/${user.email}`)
    .then((res) => setFiles(res.data))
    .catch((err) => console.error("Error fetching files:", err));
}
}, [user]);

const handleShare = async (file) => {
const viewUrl = `${API_BASE}/files/${file.uuid}/view`;
try {
    await navigator.clipboard.writeText(viewUrl);
    alert("Link copied to clipboard!");
} catch {
    alert("Could not copy, here it is:\n" + viewUrl);
}
setOpenMenu(null);
};

const handleDelete = async (uuid) => {
try {
    await axios.delete(`${API_BASE}/files/soft-delete/${uuid}`);
    setFiles((prev) => prev.filter((f) => f.uuid !== uuid));
    alert("File moved to Recently Deleted");
} catch (err) {
    console.error(err);
    alert("Could not delete file");
} finally {
    setOpenMenu(null);
}
};

return (
<div className="min-h-screen bg-gray-900 p-6">
    <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold text-white">My Files</h2>
    <Link to="/recently-deleted" className="text-sm text-red-400 underline hover:text-red-300">
        Recently Deleted
    </Link>
    </div>

    <div className="space-y-4">
    {files.length > 0 ? (
        files.map((file) => {
        const viewUrl = `${API_BASE}/files/${file.uuid}/view`;
        const downloadUrl = `${API_BASE}/files/${file.uuid}/download`;
        return (
            <div
            key={file.uuid}
            className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center"
            >
            <div>
                <p className="text-white font-semibold">{file.originalName}</p>
                <p className="text-gray-400 text-sm">
                Uploaded on: {new Date(file.createdAt).toLocaleString()}
                </p>
            </div>

            <div className="relative">
                <button
                onClick={() => setOpenMenu(openMenu === file.uuid ? null : file.uuid)}
                className="text-white px-2 py-1 rounded hover:bg-gray-700"
                >
                ⋮
                </button>

                {openMenu === file.uuid && (
                <div className="absolute right-0 mt-2 w-44 bg-gray-700 rounded shadow-lg z-10">
                    <button
                    onClick={() => window.open(viewUrl, "_blank")}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                    >
                    View
                    </button>
                    <button
                    onClick={() => window.open(downloadUrl, "_blank")}
                    className="block w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-gray-600"
                    >
                    Download
                    </button>
                    <button
                    onClick={() => handleShare(file)}
                    className="block w-full text-left px-4 py-2 text-sm text-indigo-400 hover:bg-gray-600"
                    >
                    Share
                    </button>
                    <button
                    onClick={() => handleDelete(file.uuid)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600"
                    >
                    Delete
                    </button>
                </div>
                )}
            </div>
            </div>
        );
        })
    ) : (
        <p className="text-gray-400">No files uploaded yet.</p>
    )}
    </div>
</div>
);
}
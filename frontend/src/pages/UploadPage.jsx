import React, { useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [senderEmail, setSenderEmail] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:5000/api"; // backend URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a file first!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("senderEmail", senderEmail);
    formData.append("receiverEmail", receiverEmail);

    try {
      setLoading(true);
      const { data } = await axios.post(`${API_BASE}/files/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLink(data.links.download);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Upload File</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 
            file:rounded-full file:border-0 file:text-sm file:font-semibold 
            file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
          />

          <input
            type="email"
            placeholder="Sender Email (optional)"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:outline-none"
          />

          <input
            type="email"
            placeholder="Receiver Email (optional)"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded font-semibold transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {link && (
          <div className="mt-6 bg-green-800 p-4 rounded text-center">
            <p className="text-green-300 font-semibold">✅ File uploaded successfully!</p>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline break-all"
            >
              {link}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [senderEmail, setSenderEmail] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkType, setLinkType] = useState(""); 
  const { user } = useAuth();

  const API_BASE = "http://localhost:5001/api"; 

  React.useEffect(() => {
    if (user?.email) setSenderEmail(user.email);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a file first!");
    if (!user?.email) return alert("User information not loaded. Please try again.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("senderEmail", senderEmail);
    formData.append("receiverEmail", receiverEmail);

    try {
      setLoading(true);
      const { data } = await axios.post(`${API_BASE}/files/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload response:", data); 

      const viewableTypes = [
        "image/", "video/", "audio/", "text/",
        "application/pdf",
        "application/json",
        "application/javascript",
        "application/xml",
        "application/xhtml+xml",
        "image/svg+xml",
      ];

      const fileType = file.type || "";

      let finalLink = "";

      if (data.fileUrl) {
        // ✅ backend returned full link
        finalLink = data.fileUrl;
        setLinkType(viewableTypes.some(type => fileType.startsWith(type) || fileType === type) ? "view" : "download");
      } else if (data.filename) {
        // ✅ backend returned only filename
        if (viewableTypes.some(type => fileType.startsWith(type) || fileType === type)) {
          finalLink = `${API_BASE}/files/view/${data.filename}`;
          setLinkType("view");
        } else {
          finalLink = `${API_BASE}/files/download/${data.filename}`;
          setLinkType("download");
        }
      }

      setLink(finalLink);
      setFile(null);
      setCopied(false);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
          <p className="text-white text-center">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Upload File</h2>
        <p className="text-gray-300 text-center mb-6">Welcome, {user.name}!</p>

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
            placeholder="Sender Email (auto-filled)"
            value={senderEmail}
            readOnly
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
            <p className="text-green-300 font-semibold">
              ✅ File uploaded successfully! ({linkType === "view" ? "View link" : "Download link"})
            </p>
            <div className="flex items-center justify-between bg-gray-900 p-2 rounded mt-2">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline break-all flex-1 mr-2"
              >
                {link}
              </a>
              <button
                onClick={handleCopy}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



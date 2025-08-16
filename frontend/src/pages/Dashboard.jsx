import React, { useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setMessage(`✅ ${res.data.message}: ${res.data.fileName}`);
    } catch (err) {
      setMessage("❌ Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">📂 File Transfer Dashboard</h1>

      <form
        onSubmit={handleUpload}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <label className="block mb-4">
          <span className="text-gray-300">Choose File</span>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-2 block w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer focus:border-indigo-500 focus:outline-none"
          />
        </label>

        {file && (
          <p className="text-sm text-green-400 mb-4">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-lg font-semibold"
        >
          Upload
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default Dashboard;

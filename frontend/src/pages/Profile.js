import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchUserFiles = async () => {
      if (user?.email) {
        try {
          const response = await axios.get(
            `http://localhost:5001/api/files/user/${user.email}`
          );
          setUserFiles(response.data);
        } catch (error) {
          console.error("Failed to fetch user files:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserFiles();
  }, [user]);

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await axios.delete(`http://localhost:5001/api/files/${fileId}`);
      // Remove deleted file from state
      setUserFiles((prevFiles) => prevFiles.filter((f) => f.uuid !== fileId));
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Could not delete file. Try again later.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Profile Page</h2>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Profile Page</h2>
      {user && (
        <div style={{ marginBottom: "30px" }}>
          <h3>User Information</h3>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button
            onClick={logout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}

      <div>
        <h3>Your Uploaded Files</h3>
        {userFiles.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {userFiles.map((file) => (
              <div
                key={file.uuid}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 8px 0" }}>
                      {file.originalName}
                    </h4>
                    <p style={{ margin: "4px 0", color: "#6b7280" }}>
                      Size: {formatFileSize(file.sizeBytes)} | Type:{" "}
                      {file.mimeType} | Uploaded:{" "}
                      {formatDate(file.createdAt)}
                    </p>
                    <p style={{ margin: "4px 0", color: "#6b7280" }}>
                      Downloads: {file.downloadCount} | Expires:{" "}
                      {formatDate(file.expiresAt)}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {file.expired ? (
                      <span
                        style={{
                          color: "#dc2626",
                          fontWeight: "bold",
                        }}
                      >
                        EXPIRED
                      </span>
                    ) : (
                      <a
                        href={`http://localhost:5001/api/files/${file.uuid}/download`}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "5px",
                          fontSize: "14px",
                        }}
                      >
                        Download
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteFile(file.uuid)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

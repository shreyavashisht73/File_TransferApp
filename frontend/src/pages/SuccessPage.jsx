import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function SuccessPage() {
  const { state } = useLocation();
  const data = state?.data;
  if (!data) return <div style={{ padding: 20 }}>No data. <Link to="/">Go Home</Link></div>;

  const dl = data.links.download;
  const uuid = data.uuid;

  const copy = async () => {
    await navigator.clipboard.writeText(dl);
    alert('Link copied!');
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h3>Upload Successful</h3>
      <p><strong>File:</strong> {data.originalName}</p>
      <p><strong>Download Link:</strong> <a href={dl}>{dl}</a></p>
      <button onClick={copy} style={{ marginRight: 8 }}>Copy Link</button>
      <Link to={`/d/${uuid}`}>Open Download Page</Link>
    </div>
  );
}

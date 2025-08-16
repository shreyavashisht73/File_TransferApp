import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import moment from 'moment';

export default function DownloadPage() {
  const { uuid } = useParams();
  const [meta, setMeta] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let timer;
    (async () => {
      try {
        const { data } = await api.get(`/files/${uuid}/info`);
        setMeta(data);
        setExpired(data.expired);
        // simple countdown refresh every 30s
        timer = setInterval(async () => {
          const { data } = await api.get(`/files/${uuid}/info`);
          setMeta(data);
          setExpired(data.expired);
        }, 30000);
      } catch (e) {
        setExpired(true);
      }
    })();
    return () => clearInterval(timer);
  }, [uuid]);

  if (!meta && !expired) return <div style={{ padding: 20 }}>Loading...</div>;
  if (expired) return <div style={{ padding: 20 }}>This link has expired.</div>;

  const eta = moment(meta.expiresAt).fromNow(); // e.g., "in 5 hours"
  const direct = `${import.meta.env.VITE_API_BASE}/api/files/${uuid}/download`;

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h3>Download File</h3>
      <p><strong>File:</strong> {meta.originalName}</p>
      <p><strong>Size:</strong> {(meta.sizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
      <p><strong>Expires:</strong> {eta}</p>
      <a href={direct}>
        <button style={{ padding: '8px 12px' }}>Download</button>
      </a>
      <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
        If download doesn’t start, open: <a href={direct}>{direct}</a>
      </p>
    </div>
  );
}

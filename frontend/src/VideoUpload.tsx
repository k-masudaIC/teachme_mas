import './style.css';
import { useRef, useState } from 'react';

export default function VideoUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // 認証トークンは仮でlocalStorageから取得（本番はログイン連携）
  const token = localStorage.getItem('access_token') || '';
  // マニュアルIDは仮で1
  const manualId = 1;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.length) return;
    setUploading(true);
    setMessage('アップロード中...');
    const formData = new FormData();
    formData.append('video', fileInputRef.current.files[0]);
    try {
      const res = await fetch(
        `/api/manuals/${manualId}/videos`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessage('アップロード成功！');
      setVideoUrl(`/storage/${data.file_path}`);
    } catch (err: any) {
      setMessage('アップロード失敗: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>動画アップロード</h2>
      <form onSubmit={handleUpload}>
        <input ref={fileInputRef} type="file" accept="video/*" disabled={uploading} />
        <button type="submit" disabled={uploading} style={{ marginLeft: 8 }}>
          {uploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>{message}</div>
      {videoUrl && (
        <video src={videoUrl} controls style={{ width: '100%', marginTop: 16 }} />
      )}
    </div>
  );
}

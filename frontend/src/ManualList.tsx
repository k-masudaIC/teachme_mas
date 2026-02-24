import React, { useEffect, useState } from 'react';

interface Manual {
  id: number;
  title: string;
  description?: string;
  status: string;
  folder_id: number | null;
  created_at: string;
  updated_at: string;
}

const ManualList: React.FC<{ folderId?: number | null }> = ({ folderId }) => {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let url = '/api/manuals';
    if (folderId) url += `?folder_id=${folderId}`;
    fetch(url, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('マニュアル一覧の取得に失敗しました');
        return res.json();
      })
      .then((data) => setManuals(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [folderId]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3>マニュアル一覧</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>タイトル</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>ステータス</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>作成日</th>
          </tr>
        </thead>
        <tbody>
          {manuals.map((m) => (
            <tr key={m.id}>
              <td>{m.title}</td>
              <td>{m.status}</td>
              <td>{new Date(m.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManualList;

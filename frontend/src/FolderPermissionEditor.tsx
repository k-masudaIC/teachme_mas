import React, { useEffect, useState } from 'react';

interface Permission {
  id: number;
  user_id: number | null;
  role: string | null;
  permission: 'view' | 'edit';
  user?: { id: number; name: string };
}

const FolderPermissionEditor: React.FC<{ folderId: number }> = ({ folderId }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [perm, setPerm] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/folders/${folderId}/permissions`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('権限一覧取得失敗');
        return res.json();
      })
      .then(setPermissions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [folderId]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`/api/folders/${folderId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        user_id: userId ? Number(userId) : null,
        role: role || null,
        permission: perm,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('権限追加失敗');
        return res.json();
      })
      .then(() => {
        setUserId('');
        setRole('');
        setPerm('view');
        return fetch(`/api/folders/${folderId}/permissions`, { credentials: 'include' });
      })
      .then((res) => res.json())
      .then(setPermissions)
      .catch((e) => setError(e.message));
  };

  const handleDelete = (p: Permission) => {
    fetch(`/api/folders/${folderId}/permissions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        user_id: p.user_id,
        role: p.role,
        permission: p.permission,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('権限削除失敗');
        return fetch(`/api/folders/${folderId}/permissions`, { credentials: 'include' });
      })
      .then((res) => res.json())
      .then(setPermissions)
      .catch((e) => setError(e.message));
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}>
      <h4>アクセス権限設定</h4>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="number"
          placeholder="ユーザーID(省略可)"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          style={{ width: 120 }}
        />
        <input
          placeholder="ロール(省略可)"
          value={role}
          onChange={e => setRole(e.target.value)}
          style={{ width: 100 }}
        />
        <select value={perm} onChange={e => setPerm(e.target.value as 'view' | 'edit')}>
          <option value="view">閲覧</option>
          <option value="edit">編集</option>
        </select>
        <button type="submit">追加</button>
      </form>
      <table style={{ width: '100%', fontSize: 14 }}>
        <thead>
          <tr>
            <th>ユーザーID</th>
            <th>ロール</th>
            <th>権限</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((p) => (
            <tr key={p.id}>
              <td>{p.user_id ?? ''}</td>
              <td>{p.role ?? ''}</td>
              <td>{p.permission === 'view' ? '閲覧' : '編集'}</td>
              <td>
                <button onClick={() => handleDelete(p)} style={{ color: 'red' }}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FolderPermissionEditor;

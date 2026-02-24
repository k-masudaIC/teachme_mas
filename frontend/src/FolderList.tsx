import React, { useEffect, useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FolderPermissionEditor from './FolderPermissionEditor';

interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  sort_order: number;
  children?: Folder[];
}


const FolderList: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchFolders = () => {
    setLoading(true);
    fetch('/api/folders', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('フォルダ一覧の取得に失敗しました');
        return res.json();
      })
      .then((data) => setFolders(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: newFolderName }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('作成失敗');
        return res.json();
      })
      .then(() => {
        setNewFolderName('');
        fetchFolders();
      })
      .catch((e) => setError(e.message));
  };

  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleEditSubmit = (id: number) => {
    fetch(`/api/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: editingName }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('編集失敗');
        return res.json();
      })
      .then(() => {
        setEditingId(null);
        setEditingName('');
        fetchFolders();
      })
      .catch((e) => setError(e.message));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('本当に削除しますか？')) return;
    fetch(`/api/folders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('削除失敗');
        fetchFolders();
      })
      .catch((e) => setError(e.message));
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;


  // DnD型
  const ItemType = 'FOLDER';

  // ドラッグ＆ドロップ用のフォルダ行
  const FolderRow: React.FC<{
    folder: Folder;
    level: number;
    onDrop: (dragId: number, hoverId: number) => void;
    children?: React.ReactNode;
  }> = ({ folder, level, onDrop, children }) => {
    const ref = useRef<HTMLLIElement>(null);
    const [, drop] = useDrop({
      accept: ItemType,
      drop: (item: { id: number }) => {
        if (item.id !== folder.id) onDrop(item.id, folder.id);
      },
    });
    const [{ isDragging }, drag] = useDrag({
      type: ItemType,
      item: { id: folder.id },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    drag(drop(ref));
    return (
      <li ref={ref} style={{ marginBottom: 4, opacity: isDragging ? 0.5 : 1, marginLeft: level * 20 }}>
        {editingId === folder.id ? (
          <>
            <input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              style={{ marginRight: 4 }}
            />
            <button onClick={() => handleEditSubmit(folder.id)}>保存</button>
            <button onClick={() => setEditingId(null)}>キャンセル</button>
          </>
        ) : (
          <>
            <span>{folder.name}</span>
            <button style={{ marginLeft: 8 }} onClick={() => handleEdit(folder.id, folder.name)}>編集</button>
            <button style={{ marginLeft: 4, color: 'red' }} onClick={() => handleDelete(folder.id)}>削除</button>
            <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>（ドラッグで移動）</span>
            <FolderPermissionEditor folderId={folder.id} />
          </>
        )}
        {children}
      </li>
    );
  };

  // ドロップ時の処理（例: 親変更）
  const handleDrop = (dragId: number, hoverId: number) => {
    // API連携例: dragIdのparent_idをhoverIdに変更
    fetch(`/api/folders/${dragId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ parent_id: hoverId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('階層移動失敗');
        return res.json();
      })
      .then(() => fetchFolders())
      .catch((e) => setError(e.message));
  };

  const renderFolders = (folders: Folder[], level = 0) => (
    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
      {folders.map((folder) => (
        <FolderRow key={folder.id} folder={folder} level={level} onDrop={handleDrop}>
          {folder.children && folder.children.length > 0 && renderFolders(folder.children, level + 1)}
        </FolderRow>
      ))}
    </ul>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <h2>フォルダ一覧</h2>
        <form onSubmit={handleCreate} style={{ marginBottom: 12 }}>
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="新規フォルダ名"
            style={{ marginRight: 8 }}
          />
          <button type="submit">作成</button>
        </form>
        {renderFolders(folders)}
      </div>
    </DndProvider>
  );
};

export default FolderList;

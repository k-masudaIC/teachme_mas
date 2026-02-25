import React, { useEffect, useState } from 'react';
import { apiGet } from './lib/api';


interface Manual {
  id: number;
  title: string;
  description?: string;
  status: string;
  folder_id: number | null;
  created_at: string;
  updated_at: string;
  user?: { name?: string };
}

const statusOptions = [
  { value: '', label: 'すべて' },
  { value: 'published', label: '公開' },
  { value: 'draft', label: '下書き' },
];

const sortOptions = [
  { value: 'created_at', label: '作成日' },
  { value: 'updated_at', label: '更新日' },
  { value: 'title', label: 'タイトル' },
];

const ManualList: React.FC<{ folderId?: number | null }> = ({ folderId }) => {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // ② useEffect内のfetchを置き換え
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (folderId) params.append('folder_id', String(folderId));
    if (query) params.append('query', query);
    if (status) params.append('status', status);
    if (sort) params.append('sort', sort);
    if (order) params.append('order', order);
    params.append('page', String(page));
    params.append('per_page', String(perPage));

    apiGet<{ data: Manual[]; total: number }>(`/manuals?${params.toString()}`)
      .then((data) => {
        setManuals(data.data || []);
        setTotal(data.total || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [folderId, query, status, sort, order, page, perPage]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <h3>マニュアル一覧</h3>
      <form style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }} onSubmit={e => { e.preventDefault(); setPage(1); }}>
        <input
          type="text"
          placeholder="タイトル・本文検索"
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(1); }}
          style={{ padding: 4, minWidth: 180 }}
        />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select value={order} onChange={e => setOrder(e.target.value as 'asc' | 'desc')}>
          <option value="desc">降順</option>
          <option value="asc">昇順</option>
        </select>
        <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
          {[10, 20, 50].map(n => <option key={n} value={n}>{n}件</option>)}
        </select>
        <button type="submit">検索</button>
      </form>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>タイトル</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>ステータス</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>作成者</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>作成日</th>
          </tr>
        </thead>
        <tbody>
          {manuals.map((m) => (
            <tr key={m.id}>
              <td>
                <a href={`/manuals/${m.id}`} style={{ color: '#2563eb', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">
                  {m.title}
                </a>
              </td>
              <td>{m.status === 'published' ? '公開' : '下書き'}</td>
              <td>{m.user?.name || '-'}</td>
              <td>{new Date(m.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>前へ</button>
        <span>{page} / {totalPages || 1}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>次へ</button>
        <span style={{ color: '#888', marginLeft: 8 }}>全{total}件</span>
      </div>
    </div>
  );
};

export default ManualList;

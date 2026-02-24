import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import VideoUpload from './VideoUpload';
import Layout from './Layout';

type Page = 'upload' | 'steps' | 'settings';

function Sidebar({ onSelect, current, onLogout }: { onSelect: (p: Page) => void; current: Page; onLogout: () => void }) {
  return (
    <aside style={{ width: 180, background: '#f1f5f9', padding: '2rem 0', minHeight: 'calc(100vh - 64px)', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: '#2563eb', textAlign: 'center', marginBottom: 24 }}>メニュー</div>
      <button style={sidebarBtn(current === 'upload')} onClick={() => onSelect('upload')}>動画アップロード</button>
      <button style={sidebarBtn(current === 'steps')} onClick={() => onSelect('steps')}>手順一覧</button>
      <button style={sidebarBtn(current === 'settings')} onClick={() => onSelect('settings')}>設定</button>
      <div style={{ flex: 1 }} />
      <button style={{ ...sidebarBtn(false), color: '#e11d48', fontWeight: 600 }} onClick={onLogout}>ログアウト</button>
    </aside>
  );
}

function sidebarBtn(active: boolean): React.CSSProperties {
  return {
    background: active ? '#2563eb' : 'transparent',
    color: active ? '#fff' : '#222',
    border: 'none',
    padding: '0.7rem 1.2rem',
    borderRadius: 6,
    margin: '0 1rem',
    cursor: 'pointer',
    fontWeight: active ? 700 : 500,
    fontSize: 15,
    transition: 'background 0.2s',
    marginBottom: 2,
  };
}

export default function App() {
  const [page, setPage] = useState<'login' | 'register' | Page>('login');
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('access_token'));

  const handleSwitch = (to: typeof page) => {
    setPage(to);
    if (to === 'upload' || to === 'steps' || to === 'settings') setAuthed(true);
  };

  React.useEffect(() => {
    if (localStorage.getItem('access_token')) setAuthed(true);
    else setAuthed(false);
  }, [page]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAuthed(false);
    setPage('login');
  };

  return (
    <Layout sidebar={authed ? <Sidebar onSelect={setPage as any} current={page as Page} onLogout={handleLogout} /> : undefined}>
      {!authed ? (
        <>
          {page === 'login' ? <Login /> : <Register />}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            {page === 'login' ? (
              <button onClick={() => handleSwitch('register')}>新規登録へ</button>
            ) : (
              <button onClick={() => handleSwitch('login')}>ログインへ</button>
            )}
          </div>
        </>
      ) : (
        <>
          {page === 'upload' && <VideoUpload />}
          {page === 'steps' && <div>手順一覧（今後実装）</div>}
          {page === 'settings' && <div>設定（今後実装）</div>}
        </>
      )}
    </Layout>
  );
}

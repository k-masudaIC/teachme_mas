import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import VideoUpload from './VideoUpload';
import Layout from './Layout';
import FolderList from './FolderList';
import ManualList from './ManualList';

type Page = 'upload' | 'steps' | 'settings' | 'folders' | 'users' | 'permissions';

function Sidebar({ onSelect, current, onLogout }: { onSelect: (p: Page) => void; current: Page; onLogout: () => void }) {
  return (
    <aside style={{ width: 180, background: '#f1f5f9', padding: '2rem 0', minHeight: 'calc(100vh - 64px)', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: '#2563eb', textAlign: 'center', marginBottom: 24 }}>メニュー</div>
      <button style={sidebarBtn(current === 'upload')} onClick={() => onSelect('upload')}>動画アップロード</button>
      <button style={sidebarBtn(current === 'steps')} onClick={() => onSelect('steps')}>手順一覧</button>
      <button style={sidebarBtn(current === 'folders')} onClick={() => onSelect('folders')}>フォルダ管理</button>
      <button style={sidebarBtn(current === 'users')} onClick={() => onSelect('users')}>ユーザー管理</button>
      <button style={sidebarBtn(current === 'permissions')} onClick={() => onSelect('permissions')}>権限管理</button>
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

  // ✅ ログイン・登録成功時に管理画面へ遷移するコールバック
  const handleAuthSuccess = () => {
    setAuthed(true);
    setPage('upload');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAuthed(false);
    setPage('login');
  };

  return (
    <Layout sidebar={authed ? <Sidebar onSelect={setPage as any} current={page as Page} onLogout={handleLogout} /> : undefined}>
      {!authed ? (
        <>
          {page === 'login'
            ? <Login onSuccess={handleAuthSuccess} onSwitchToRegister={() => setPage('register')} />
            : <Register onSuccess={handleAuthSuccess} onSwitchToLogin={() => setPage('login')} />
          }
        </>
      ) : (
        <>
          {page === 'upload' && <VideoUpload />}
          {page === 'steps' && (
            <div style={{ display: 'flex', gap: 32 }}>
              <div style={{ minWidth: 260, flex: '0 0 260px' }}>
                <FolderList />
              </div>
              <div style={{ flex: 1 }}>
                <ManualList />
              </div>
            </div>
          )}
          {page === 'folders' && <div style={{ padding: '1rem' }}><FolderList /></div>}
          {page === 'users' && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>ユーザー管理</h2>
              <p>システム利用ユーザーの一覧・新規登録・編集・削除ができます。<br />
                <span style={{ color: '#888' }}>（今後、ユーザー追加・編集・削除、ロール切替、パスワードリセット等を実装予定）</span>
              </p>
            </div>
          )}
          {page === 'permissions' && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>権限管理</h2>
              <p>フォルダやマニュアルごとのアクセス権限を管理できます。<br />
                <span style={{ color: '#888' }}>（今後、フォルダ単位の権限設定・ロール管理機能を実装予定）</span>
              </p>
            </div>
          )}
          {page === 'settings' && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>設定</h2>
              <p>システム全体の設定を行います。<br />
                <span style={{ color: '#888' }}>（今後、各種設定画面を実装予定）</span>
              </p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
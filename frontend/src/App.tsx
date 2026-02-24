import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import VideoUpload from './VideoUpload';

export default function App() {
  const [page, setPage] = useState<'login' | 'register' | 'upload'>('login');
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('access_token'));

  const handleSwitch = (to: 'login' | 'register' | 'upload') => {
    setPage(to);
    if (to === 'upload') setAuthed(true);
  };

  React.useEffect(() => {
    if (localStorage.getItem('access_token')) setAuthed(true);
    else setAuthed(false);
  }, [page]);

  if (!authed) {
    return (
      <div>
        {page === 'login' ? <Login /> : <Register />}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {page === 'login' ? (
            <button onClick={() => handleSwitch('register')}>新規登録へ</button>
          ) : (
            <button onClick={() => handleSwitch('login')}>ログインへ</button>
          )}
        </div>
      </div>
    );
  }

  return <VideoUpload />;
}

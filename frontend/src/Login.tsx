import { useRef, useState } from 'react';

export default function Login() {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailRef.current?.value,
          password: passwordRef.current?.value,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      setMessage('ログイン成功！');
    } catch (err: any) {
      setMessage('ログイン失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>ログイン</h2>
      <form onSubmit={handleLogin}>
        <input ref={emailRef} type="email" placeholder="メールアドレス" required disabled={loading} style={{ width: '100%', marginBottom: 8 }} />
        <input ref={passwordRef} type="password" placeholder="パスワード" required disabled={loading} style={{ width: '100%', marginBottom: 8 }} />
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>{message}</div>
    </div>
  );
}

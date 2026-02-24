import { useRef, useState } from 'react';

export default function Register() {
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameRef.current?.value,
          email: emailRef.current?.value,
          password: passwordRef.current?.value,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      setMessage('登録成功！');
    } catch (err: any) {
      setMessage('登録失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>新規登録</h2>
      <form onSubmit={handleRegister}>
        <input ref={nameRef} type="text" placeholder="名前" required disabled={loading} style={{ width: '100%', marginBottom: 8 }} />
        <input ref={emailRef} type="email" placeholder="メールアドレス" required disabled={loading} style={{ width: '100%', marginBottom: 8 }} />
        <input ref={passwordRef} type="password" placeholder="パスワード" required disabled={loading} style={{ width: '100%', marginBottom: 8 }} />
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? '登録中...' : '新規登録'}
        </button>
      </form>
      <div style={{ marginTop: 16 }}>{message}</div>
    </div>
  );
}

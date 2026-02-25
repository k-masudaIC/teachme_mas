import { useRef, useState } from 'react';

// ✅ onSuccess・onSwitchToLoginをpropsで受け取る
interface Props {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function Register({ onSuccess, onSwitchToLogin }: Props) {
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
      onSuccess(); // ✅ 管理画面へ遷移
    } catch (err: any) {
      setMessage('登録失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f0f4f8 0%, #e0e7ef 100%)',
      fontFamily: '"Segoe UI", "Noto Sans JP", Arial, sans-serif',
    }}>
      <div style={{
        width: 400,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <img src="/logo192.png" alt="teachme.mas" style={{ width: 48, marginBottom: 8 }} />
          <h1 style={{ fontWeight: 700, fontSize: 28, margin: 0, color: '#2d3748' }}>teachme.mas</h1>
          <div style={{ color: '#718096', fontSize: 15, marginTop: 4 }}>社内業務マニュアル自動生成システム</div>
        </div>
        <form onSubmit={handleRegister} style={{ width: '100%' }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, color: '#4a5568', fontSize: 15 }}>氏名</label>
            <input ref={nameRef} type="text" placeholder="氏名" required disabled={loading}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 6, fontSize: 16, background: '#f8fafc', outline: 'none', marginBottom: 2 }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, color: '#4a5568', fontSize: 15 }}>メールアドレス</label>
            <input ref={emailRef} type="email" placeholder="your@email.com" required disabled={loading}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 6, fontSize: 16, background: '#f8fafc', outline: 'none', marginBottom: 2 }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, color: '#4a5568', fontSize: 15 }}>パスワード</label>
            <input ref={passwordRef} type="password" placeholder="パスワード" required disabled={loading}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginTop: 6, fontSize: 16, background: '#f8fafc', outline: 'none', marginBottom: 2 }}
            />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(90deg, #4f8cff 0%, #38b2ac 100%)', color: '#fff', fontWeight: 600, fontSize: 17, border: 'none', borderRadius: 8, padding: '12px 0', marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '登録中...' : '新規登録'}
          </button>
        </form>
        <div style={{ marginTop: 18, color: '#e53e3e', minHeight: 24, fontSize: 15 }}>{message}</div>
        {/* ✅ ボタンに変更 */}
        <div style={{ marginTop: 8, fontSize: 14, color: '#4a5568' }}>
          すでにアカウントをお持ちの方は{' '}
          <button onClick={onSwitchToLogin} style={{ color: '#4f8cff', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}>
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
}
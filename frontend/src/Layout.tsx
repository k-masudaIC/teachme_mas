import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)' }}>
      <header style={{ background: '#2563eb', color: '#fff', padding: '1rem 2rem', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
        teachme.mas 管理画面
      </header>
      <main style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 32 }}>
        {children}
      </main>
      <footer style={{ textAlign: 'center', color: '#888', fontSize: 13, margin: '2rem 0 0 0' }}>
        &copy; 2026 teachme.mas
      </footer>
    </div>
  );
}

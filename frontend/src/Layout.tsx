import React from 'react';

export default function Layout({ children, sidebar }: { children: React.ReactNode, sidebar?: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)' }}>
      <header style={{ background: '#2563eb', color: '#fff', padding: '1rem 2rem', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
        teachme.mas 管理画面
      </header>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {sidebar && <div style={{ minWidth: 180 }}>{sidebar}</div>}
        <main style={{ flex: 1, maxWidth: 800, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '#0001 0 2px 16px', padding: 32 }}>
          {children}
        </main>
      </div>
      <footer style={{ textAlign: 'center', color: '#888', fontSize: 13, margin: '2rem 0 0 0' }}>
        &copy; 2026 teachme.mas
      </footer>
    </div>
  );
}

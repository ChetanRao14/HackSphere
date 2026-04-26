import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, width: '100%', margin: '0 auto', padding: '36px 28px', boxSizing: 'border-box' }}>
        <Outlet />
      </main>
      <footer style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid #e2e8f0', background: 'white' }}>
        © 2026 HackSphere — Hackathon Management Platform
      </footer>
    </div>
  );
};

export default Layout;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PlanModal from './PlanModal';

const navItems = [
  { path: '/', icon: 'ti-home', label: 'Inicio' },
  { path: '/clientes', icon: 'ti-users', label: 'Clientes' },
  { path: '/historial', icon: 'ti-history', label: 'Historial' },
  { path: '/perfil', icon: 'ti-user', label: 'Perfil' },
];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  topbarLeft?: React.ReactNode;
}

const Layout = ({ children, title, topbarLeft }: LayoutProps) => {
  const location = useLocation();
  const { plan, setPlanModal } = useApp();

  return (
    <div className="app-shell">
      {/* Sidebar — desktop */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">Lo</div>
          <span className="logo-name">Loomi</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/crear" className="sidebar-item create-item">
            <i className="ti ti-plus" />
            Crear Recibo
          </Link>

          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item${location.pathname === item.path ? ' active' : ''}`}
            >
              <i className={`ti ${item.icon}`} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className={`plan-badge${plan === 'pro' ? ' pro' : ''}`}
            onClick={() => setPlanModal(true)}
          >
            {plan === 'pro' ? 'Pro ✦' : 'Free'}
          </button>
          <div className="avatar-sm" style={{ marginLeft: 'auto' }}>CM</div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            {topbarLeft}
            {title && <span className="topbar-title">{title}</span>}
          </div>
          <div className="topbar-right">
            <button
              className={`plan-badge${plan === 'pro' ? ' pro' : ''}`}
              onClick={() => setPlanModal(true)}
            >
              {plan === 'pro' ? 'Pro ✦' : 'Free'}
            </button>
            <div className="avatar-sm">CM</div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="bottom-nav">
        <Link to="/" className={`nav-btn${location.pathname === '/' ? ' active' : ''}`}>
          <i className="ti ti-home" /><span>Inicio</span>
        </Link>
        <Link to="/clientes" className={`nav-btn${location.pathname === '/clientes' ? ' active' : ''}`}>
          <i className="ti ti-users" /><span>Clientes</span>
        </Link>
        <Link to="/crear" className="nav-btn nav-btn-create">
          <i className="ti ti-plus" />
        </Link>
        <Link to="/historial" className={`nav-btn${location.pathname === '/historial' ? ' active' : ''}`}>
          <i className="ti ti-history" /><span>Historial</span>
        </Link>
        <Link to="/perfil" className={`nav-btn${location.pathname === '/perfil' ? ' active' : ''}`}>
          <i className="ti ti-user" /><span>Perfil</span>
        </Link>
      </nav>

      <PlanModal />
    </div>
  );
};

export default Layout;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Inicio' },
  { path: '/crear', label: 'Crear' },
  { path: '/cobros', label: 'Cobros' },
  { path: '/historial', label: 'Historial' },
  { path: '/perfil', label: 'Perfil' },
  { path: '/planes', label: 'Planes' },
];

const NavBar = () => {
  const location = useLocation();
  return (
    <nav style={{display:'flex',justifyContent:'space-around',padding:'1rem 0',background:'#1a1a1a',borderTop:'1px solid #333',position:'fixed',bottom:0,left:0,right:0,zIndex:100}}>
      {navItems.map(item => (
        <Link key={item.path} to={item.path} style={{color:location.pathname===item.path?'var(--accent)':'#aaa',fontWeight:600,textDecoration:'none'}}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;

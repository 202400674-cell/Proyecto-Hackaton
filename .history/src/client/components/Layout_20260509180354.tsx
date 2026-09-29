import React from 'react';
import NavBar from './NavBar';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div style={{minHeight:'100vh',paddingBottom:'60px'}}>
    {children}
    <NavBar />
  </div>
);

export default Layout;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Inicio from './pages/Inicio';
import Crear from './pages/Crear';
import Clientes from './pages/Clientes';
import Historial from './pages/Historial';
import Perfil from './pages/Perfil';

const App = () => (
  <AppProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/crear" element={<Crear />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </AppProvider>
);

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Crear from './pages/Crear';
import Cobros from './pages/Cobros';
import Historial from './pages/Historial';
import Perfil from './pages/Perfil';
import Planes from './pages/Planes';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/crear" element={<Crear />} />
      <Route path="/cobros" element={<Cobros />} />
      <Route path="/historial" element={<Historial />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/planes" element={<Planes />} />
    </Routes>
  </Router>
);

export default App;

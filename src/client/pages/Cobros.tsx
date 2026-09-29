import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Invoice } from '../../shared/types';

const Cobros = () => {
  const [cobros, setCobros] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => setCobros(data));
  }, []);

  return (
    <Layout>
      <div style={{padding:'2rem 1rem'}}>
        <h1 style={{fontSize:'2rem',fontWeight:700}}>Mis Cobros</h1>
        <div style={{marginTop:20}}>
          {cobros.length === 0 ? (
            <div>No hay cobros activos.</div>
          ) : (
            cobros.map((cobro, index) => (
              <div key={cobro.id ?? index} style={{background:'#222',borderRadius:12,padding:16,marginBottom:14}}>
                <div style={{fontWeight:700}}>{cobro.descripcion}</div>
                <div>Cliente: {cobro.cliente}</div>
                <div>Oficio: {cobro.oficio}</div>
                <div>Monto: <span style={{color:'var(--accent)',fontWeight:700}}>${cobro.monto}</span></div>
                <div>Método: {cobro.metodo}</div>
                <div>Fecha: {cobro.fecha}</div>
                <div>Vence: {cobro.vencimiento}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cobros;

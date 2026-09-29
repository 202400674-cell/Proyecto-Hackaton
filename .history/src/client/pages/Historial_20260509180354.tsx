import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Invoice } from '../../shared/types';

const Historial = () => {
  const [historial, setHistorial] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => setHistorial(data));
  }, []);

  return (
    <Layout>
      <div style={{padding:'2rem 1rem'}}>
        <h1 style={{fontSize:'2rem',fontWeight:700}}>Historial</h1>
        <div style={{marginTop:20}}>
          {historial.length === 0 ? (
            <div>No hay facturas en el historial.</div>
          ) : (
            historial.map(factura => (
              <div key={factura.id} style={{background:'#222',borderRadius:12,padding:16,marginBottom:14}}>
                <div style={{fontWeight:700}}>{factura.descripcion}</div>
                <div>Cliente: {factura.cliente}</div>
                <div>Oficio: {factura.oficio}</div>
                <div>Monto: <span style={{color:'var(--accent)',fontWeight:700}}>${factura.monto}</span></div>
                <div>Método: {factura.metodo}</div>
                <div>Fecha: {factura.fecha}</div>
                <div>Vence: {factura.vencimiento}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Historial;

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Invoice } from '../../shared/types';

const Inicio = () => {
  const [facturas, setFacturas] = useState<Invoice[]>([]);

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => setFacturas(data));
  }, []);

  const totalCobrado = facturas.reduce((acc, f) => acc + Number(f.monto), 0);

  return (
    <Layout>
      <div style={{padding:'2rem 1rem'}}>
        <h1 style={{fontSize:'2rem',fontWeight:700}}>Bienvenido a Loomi</h1>
        <div style={{margin:'1.5rem 0'}}>
          <div style={{background:'#222',borderRadius:12,padding:20,marginBottom:12}}>
            <div style={{fontWeight:600}}>Total cobrado</div>
            <div style={{fontSize:28,fontWeight:800}}>${totalCobrado}</div>
            <div style={{color:'#aaa'}}>{facturas.length} facturas registradas</div>
          </div>
        </div>
        <div style={{fontSize:12,color:'#aaa'}}>Infraestructura de cobros · <span style={{color:'var(--accent)'}}>Fin-Core</span> · Blockchain</div>
      </div>
    </Layout>
  );
};

export default Inicio;

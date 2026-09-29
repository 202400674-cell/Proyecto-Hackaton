import React from 'react';
import Layout from '../components/Layout';

const Inicio = () => (
  <Layout>
    <div style={{padding:'2rem 1rem'}}>
      <h1 style={{fontSize:'2rem',fontWeight:700}}>Bienvenido a Loomi</h1>
      <div style={{margin:'1.5rem 0'}}>
        <div style={{background:'#222',borderRadius:12,padding:20,marginBottom:12}}>
          <div style={{fontWeight:600}}>Total cobrado</div>
          <div style={{fontSize:28,fontWeight:800}}>$630</div>
          <div style={{color:'#aaa'}}>7 facturas este mes</div>
        </div>
        <div style={{background:'#222',borderRadius:12,padding:20}}>
          <div style={{fontWeight:600}}>Índice Comercial</div>
          <div style={{fontSize:28,fontWeight:800,color:'var(--accent)'}}>87<span style={{fontSize:16,color:'#888'}}>/100</span></div>
          <div style={{color:'var(--accent)',fontWeight:700}}>Muy activo</div>
        </div>
      </div>
      <div style={{fontSize:12,color:'#aaa'}}>Infraestructura de cobros · <span style={{color:'var(--accent)'}}>Fin-Core</span> · Blockchain</div>
    </div>
  </Layout>
);

export default Inicio;

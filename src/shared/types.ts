export interface Invoice {
  id?: number;
  cliente: string;
  descripcion: string;
  oficio: string;
  monto: number;
  metodo: string;
  fecha: string;
  vencimiento: string;
  notas?: string;
}

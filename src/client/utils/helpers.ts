export const PAYMENT_ICONS: Record<string, string> = {
  servicio: 'ti-briefcase',
  alquiler: 'ti-building',
  producto: 'ti-package',
  consultoria: 'ti-bulb',
  'diseño': 'ti-palette',
  otro: 'ti-receipt',
};

export const METHOD_LABELS: Record<string, string> = {
  efectivo: '💵 Efectivo',
  transferencia: '🏦 Transferencia',
  quickpay: '📲 QuickPay',
  deposito: '🧾 Depósito',
  cheque: '📑 Cheque',
  wallet: '💳 Wallet',
  otro: '· Otro',
};

export function fmtDate(d: string): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`;
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

export function rand4(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function rh(n: number): string {
  return Array.from({ length: n * 2 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
}

export function getBadge(status: string): { cls: string; label: string } {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: 'badge-pending', label: 'Pendiente' },
    confirmed: { cls: 'badge-confirmed', label: 'Confirmado' },
    rejected: { cls: 'badge-rejected', label: 'Rechazado' },
  };
  return map[status] ?? { cls: 'badge-pending', label: 'Pendiente' };
}

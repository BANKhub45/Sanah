export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('th-TH').format(val);
}

export function formatThaiDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatThaiDateShort(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function generateOrderId(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SN${year}${month}${day}-${random}`;
}

export function generateTrackingNumber(courier: string): string {
  const prefixMap: Record<string, string> = {
    'Flash Express': 'TH',
    'J&T Express': 'JT',
    'Kerry Express': 'KEX',
    'ไปรษณีย์ไทย EMS': 'ED',
    'รับเองหน้าร้าน': 'PICKUP',
  };
  const prefix = prefixMap[courier] || 'SN';
  const digits = Math.floor(1000000000 + Math.random() * 9000000000);
  if (courier === 'ไปรษณีย์ไทย EMS') {
    return `${prefix}${String(digits).slice(0, 9)}TH`;
  }
  return `${prefix}${digits}`;
}

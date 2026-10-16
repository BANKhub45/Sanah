import QRCode from 'qrcode';

// CRC16 CCITT calculation for EMVCo
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return ('0000' + crc.toString(16).toUpperCase()).slice(-4);
}

// Generate EMVCo PromptPay payload for Mobile Number or National ID
export function generatePromptPayPayload(target: string, amount?: number): string {
  // Format target: remove dashes/spaces
  const cleanTarget = target.replace(/[^0-9]/g, '');
  let formattedTarget = '';
  let targetType = '';

  if (cleanTarget.length === 10) {
    // Mobile number: prefix with 0066 and drop leading 0 -> e.g. 0066819598877
    formattedTarget = '0066' + cleanTarget.slice(1);
    targetType = '01'; // mobile
  } else if (cleanTarget.length === 13) {
    // National ID or Tax ID
    formattedTarget = cleanTarget;
    targetType = '02';
  } else {
    // Fallback standard
    formattedTarget = cleanTarget;
    targetType = '01';
  }

  // Tag 29: Merchant Account Information - PromptPay
  const aid = 'A000000677010111';
  const tag29_00 = '00' + ('00' + aid.length).slice(-2) + aid;
  const tag29_01 = targetType + ('00' + formattedTarget.length).slice(-2) + formattedTarget;
  const tag29Value = tag29_00 + tag29_01;
  const tag29 = '29' + ('00' + tag29Value.length).slice(-2) + tag29Value;

  // Tag 00: Payload Format Indicator
  let payload = '000201';
  // Tag 01: Point of Initiation Method (12 = Dynamic for specific amount, 11 = Static)
  payload += amount ? '010212' : '010211';
  payload += tag29;
  // Tag 53: Transaction Currency (764 = THB)
  payload += '5303764';

  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += '54' + ('00' + formattedAmount.length).slice(-2) + formattedAmount;
  }

  // Tag 58: Country Code
  payload += '5802TH';
  // Tag 63: CRC prefix
  payload += '6304';

  const checksum = crc16(payload);
  return payload + checksum;
}

// Generate QR Code data URL for PromptPay
export async function generatePromptPayQRCode(target: string, amount?: number): Promise<string> {
  try {
    const payload = generatePromptPayPayload(target, amount);
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f2444',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    // Fallback placeholder
    return '';
  }
}

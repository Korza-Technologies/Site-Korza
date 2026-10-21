import { WHATSAPP_NUMBER, MESSAGES } from './config.js';

// WhatsApp link with the message for the place the visitor clicked from.
export function waLink(location, caseName) {
  const message = MESSAGES[location];
  if (!message) throw new Error(`Unknown WhatsApp location: ${location}`);
  const text = typeof message === 'function' ? message(caseName) : message;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

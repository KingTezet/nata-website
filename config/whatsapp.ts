/**
 * Konfigurasi WhatsApp — SATU-SATUNYA tempat nomor disimpan.
 *
 * Nomor asli (format lokal): 085926270826
 * Format internasional wa.me: ganti "0" pertama dengan kode negara "62" → 6285926270826
 */
export const WHATSAPP_LOCAL_NUMBER = "085926270826";
export const WHATSAPP_COUNTRY_CODE = "62";

export const WHATSAPP_NUMBER = `${WHATSAPP_COUNTRY_CODE}${WHATSAPP_LOCAL_NUMBER.replace(/^0/, "")}`;

/** Link Click to Chat polos (tanpa pesan). */
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

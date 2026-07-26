/**
 * sensoryIQ — приймає заявку з форми сайту і пересилає її в Telegram.
 *
 * НАЛАШТУВАННЯ (робиться один раз при деплої):
 * 1. Створіть бота у @BotFather в Telegram → отримаєте BOT_TOKEN.
 * 2. Напишіть боту будь-яке повідомлення (або додайте його в потрібний чат/канал).
 * 3. Дізнайтесь CHAT_ID:
 *      відкрийте https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
 *      і знайдіть там "chat":{"id":...}
 * 4. У Cloudflare Workers → Settings → Variables додайте секрети:
 *      BOT_TOKEN = токен бота
 *      CHAT_ID   = id чату/каналу, куди слати заявки
 *      ALLOWED_ORIGIN = адреса вашого сайту (напр. https://username.github.io)
 *
 * ЩОБ ПЕРЕМКНУТИ НА ІНШУ ЛЮДИНУ/БІЗНЕС:
 * Просто заміните значення CHAT_ID (і за бажанням BOT_TOKEN) у Variables —
 * код нижче чіпати не потрібно. Можна тримати кілька Worker'ів з різними
 * CHAT_ID для різних клієнтів і перемикати сайт між ними, міняючи лише
 * TELEGRAM_ENDPOINT у script.js.
 */

export default {
  async fetch(request, env) {
    // Дозволяємо запити лише з вашого сайту (CORS)
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response('Bad request', { status: 400, headers: corsHeaders });
    }

    const name = (data.name || '').toString().trim().slice(0, 200);
    const phone = (data.phone || '').toString().trim().slice(0, 60);
    const child = (data.child || '').toString().trim().slice(0, 200);
    const message = (data.message || '').toString().trim().slice(0, 1000);

    // Серверна перевірка номера телефону (дублює клієнтську, бо клієнтську
    // легко обійти) — вимагає 10-15 цифр, не всі однакові.
    const digitsOnly = phone.replace(/[^\d]/g, '');
    const looksLikePhone =
      /^[\d\s()+-]+$/.test(phone) &&
      digitsOnly.length >= 10 &&
      digitsOnly.length <= 15 &&
      !/^(\d)\1+$/.test(digitsOnly);

    if (!name || !looksLikePhone) {
      return new Response('Invalid data', { status: 422, headers: corsHeaders });
    }

    const text =
      `📩 Нова заявка з сайту sensoryIQ\n\n` +
      `👤 Ім'я: ${name}\n` +
      `📞 Телефон: ${phone}\n` +
      (child ? `🧒 Дитина: ${child}\n` : '') +
      (message ? `💬 Запит: ${message}\n` : '');

    const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text,
      }),
    });

    if (!tgRes.ok) {
      return new Response('Failed to notify', { status: 502, headers: corsHeaders });
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  },
};

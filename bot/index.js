// Task Earn BD - Telegram Bot (Backup / Referral system)
// Runs alongside the Mini App. Users open the app via /start and get a referral link.
//
// Setup:
//   1. npm install node-telegram-bot-api
//   2. Set BOT_TOKEN env var (from @BotFather)
//   3. Set WEBAPP_URL to your deployed Mini App URL
//   4. node bot/index.js
//
// Note: Referral tracking & rewards happen inside the Mini App (localStorage / Capacitor).
// This bot only generates deep links with ?start=REFCODE so the app can credit referrers.

const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://blackff444.github.io/task-earn-bd/';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Inline keyboard that opens the Mini App
function getAppKeyboard(refCode) {
  const url = refCode ? `${WEBAPP_URL}?start=${refCode}` : WEBAPP_URL;
  return {
    reply_markup: {
      inline_keyboard: [[
        { text: '🚀 Open Task Earn BD', web_app: { url } }
      ]]
    }
  };
}

bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const refCode = match && match[1] ? match[1].trim() : null;

  const referralNote = refCode
    ? `\n\n🔗 You joined with a referral code: *${refCode}*`
    : '';

  bot.sendMessage(
    chatId,
    `👋 *Welcome to Task Earn BD!*\n\n` +
    `Complete micro-tasks, claim daily streaks & withdraw BDT via bKash/Nagad.` +
    `${referralNote}\n\n` +
    `Tap below to open the app:`,
    { parse_mode: 'Markdown', ...getAppKeyboard(refCode) }
  );
});

bot.onText(/\/refer/, (msg) => {
  const chatId = msg.chat.id;
  // The app generates the user's own referral code; bot just opens app.
  bot.sendMessage(
    chatId,
    `🔗 *Your Referral Link*\n\nOpen the app and copy your personal referral code from the Profile tab, then share it. Anyone who joins via your link earns you ৳5 BDT bonus!`,
    { parse_mode: 'Markdown', ...getAppKeyboard() }
  );
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `*Task Earn BD Help*\n\n` +
    `/start - Open the app\n` +
    `/refer - Get referral info\n` +
    `/help - This message`,
    { parse_mode: 'Markdown' }
  );
});

console.log('Task Earn BD bot is running...');

# Telegram Mini App Bot Setup Guide

## Step 1: Create Bot with @BotFather

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Enter a name: `Task Earn BD`
4. Enter a username: `TaskEarnBDBot` (must end with `bot`)
5. Copy the **API Token** (e.g., `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

## Step 2: Configure Bot Settings

Send these commands to @BotFather:

```
/setmenubutton
```
1. Select your bot
2. Enter URL: `https://your-domain.com` (or test URL)
3. Enter button text: `Open Task Earn BD`

Or use the newer Web App method:

```
/setmenubutton
@TaskEarnBDBot
Open Task Earn BD
https://your-domain.com
```

## Step 3: Set Bot Description

```
/setdescription
```
Complete simple micro-social tasks, claim daily rewards & withdraw USDT instantly!

## Step 4: Set Bot Commands

```
/setcommands
```
```
start - Open Task Earn BD App
help - Get help
```

## Step 5: Deploy Your App

### Option A: Vercel (Free)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option B: Netlify (Free)
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Option C: GitHub Pages
1. Push code to GitHub
2. Go to Settings > Pages
3. Select `dist` folder
4. Your app will be at `https://username.github.io/repo-name`

## Step 6: Update Bot Web App URL

After deploying, update the bot's Web App URL:

```
/setmenubutton
@TaskEarnBDBot
Open Task Earn BD
https://your-deployed-url.com
```

## Step 7: Test Your Bot

1. Open your bot in Telegram: `@TaskEarnBDBot`
2. Click **Open Task Earn BD** button
3. The app should open inside Telegram

## Step 8: Production BotFather Commands

### Enable Payments (Optional)
```
/newpay
```
Follow the steps to set up payment provider for USDT withdrawals.

### Set Profile Photo
Send a photo to @BotFather with your bot selected to set profile picture.

## Important Notes

1. **HTTPS Required**: Your domain MUST use HTTPS
2. **Valid SSL Certificate**: Certificate must be valid (not self-signed)
3. **Bot Token Security**: Never expose your bot token in code
4. **InitData Validation**: Always validate `initData` on server for production

## Server-Side Validation (Recommended for Production)

```javascript
// Node.js example for validating Telegram initData
const crypto = require('crypto');

function validateTelegramData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

## Environment Variables (for Node.js backend)

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=TaskEarnBDBot
APP_URL=https://your-domain.com
```

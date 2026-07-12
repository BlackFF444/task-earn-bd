// Simple deploy script for Telegram Mini App
// Run: node deploy.js

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function deploy() {
  console.log('\n🚀 Telegram Mini App Deploy Script\n');
  console.log('====================================\n');

  // Check if dist exists
  if (!existsSync('dist')) {
    console.log('📦 Building project...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  console.log('\nChoose deployment platform:\n');
  console.log('1. Vercel (Recommended - Free)');
  console.log('2. Netlify (Free)');
  console.log('3. GitHub Pages');
  console.log('4. Custom (Manual)\n');

  const choice = await question('Enter choice (1-4): ');

  switch (choice) {
    case '1':
      console.log('\n📦 Deploying to Vercel...');
      try {
        execSync('vercel --prod', { stdio: 'inherit' });
        console.log('\n✅ Deployed successfully!');
      } catch {
        console.log('\n⚠️  Vercel not installed. Run: npm i -g vercel');
      }
      break;

    case '2':
      console.log('\n📦 Deploying to Netlify...');
      try {
        execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
        console.log('\n✅ Deployed successfully!');
      } catch {
        console.log('\n⚠️  Netlify not installed. Run: npm i -g netlify-cli');
      }
      break;

    case '3':
      console.log('\n📦 GitHub Pages Deployment:');
      console.log('1. Push code to GitHub');
      console.log('2. Go to Settings > Pages');
      console.log('3. Select "dist" folder');
      console.log('4. Your URL: https://username.github.io/repo-name\n');
      break;

    case '4':
      const url = await question('\nEnter your deployment URL: ');
      console.log(`\n✅ Update your bot's WebApp URL to: ${url}`);
      console.log('Send to @BotFather: /setmenubutton');
      break;

    default:
      console.log('Invalid choice');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Go to @BotFather on Telegram');
  console.log('2. Send: /setmenubutton');
  console.log('3. Select your bot');
  console.log('4. Enter your deployed URL\n');

  rl.close();
}

deploy().catch(console.error);

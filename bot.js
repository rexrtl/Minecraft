const http = require('http');
const mineflayer = require('mineflayer');
const config = require('./config.json');

const PORT = process.env.PORT || 3000;

// 🌐 HTTP Keep Alive Server
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Mineflayer bot is running\n');
}).listen(PORT, () => {
  console.log(`🌐 HTTP server running on port ${PORT}`);
});

let bot;
let movementPhase = 0;

const STEP_INTERVAL = 1500;
const JUMP_DURATION = 500;
const RECONNECT_DELAY = 5000; // 5 seconds

function startBot() {
  console.log('🔄 Connecting bot...');

  bot = mineflayer.createBot({
    host: config.serverHost,
    port: config.serverPort,
    username: config.botUsername,
    auth: 'offline',
    version: false,
    viewDistance: config.botChunk
  });

  bot.on('spawn', () => {
    console.log(`✅ ${config.botUsername} spawned`);

    setTimeout(() => {
      bot.setControlState('sneak', true);
    }, 3000);

    setTimeout(movementCycle, STEP_INTERVAL);
  });

  bot.on('kicked', (reason) => {
    console.log('🚫 Kicked from server:', reason.toString());
  });

  bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
  });

  bot.on('end', () => {
    console.log(`⛔ Disconnected. Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
    setTimeout(startBot, RECONNECT_DELAY);
  });
}

// 🕺 Anti-AFK movement
function movementCycle() {
  if (!bot || !bot.entity) return;

  bot.clearControlStates();

  switch (movementPhase) {
    case 0:
      bot.setControlState('forward', true);
      break;
    case 1:
      bot.setControlState('back', true);
      break;
    case 2:
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), JUMP_DURATION);
      break;
    default:
      break;
  }

  movementPhase = (movementPhase + 1) % 4;
  setTimeout(movementCycle, STEP_INTERVAL);
}

// 🚀 Start bot
startBot();

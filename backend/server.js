const http = require('http');

const cors = require('cors');
const express = require('express');
const cron = require('node-cron');
const { Server } = require('socket.io');

const { scrapeResults } = require('./scraper');

const PORT = 3001;
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST']
  }
});

let latestResults = null;
let isScraping = false;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    }
  })
);

app.get('/api/results', (request, response) => {
  if (!latestResults) {
    response.status(503).json({
      message: 'முடிவுகள் இன்னும் கிடைக்கவில்லை'
    });
    return;
  }

  response.json(latestResults);
});

io.on('connection', (socket) => {
  console.log(`[socket] Client connected: ${socket.id}`);

  if (latestResults) {
    socket.emit('results', latestResults);
  }

  socket.on('disconnect', () => {
    console.log(`[socket] Client disconnected: ${socket.id}`);
  });
});

async function fetchAndBroadcast() {
  if (isScraping) {
    console.warn('[server] Previous scrape is still running. Skipping this cycle.');
    return;
  }

  isScraping = true;

  try {
    const results = await scrapeResults();
    latestResults = results;
    io.emit('results', latestResults);
  } catch (error) {
    console.error(`[server] Failed to refresh results: ${error.message}`);
  } finally {
    isScraping = false;
  }
}

async function bootstrap() {
  await fetchAndBroadcast();

  cron.schedule('*/5 * * * *', fetchAndBroadcast, {
    timezone: 'Asia/Kolkata'
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} | Next scrape in 5 minutes`);
  });
}

bootstrap();

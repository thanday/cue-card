const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const TELEGRAM_BOT_TOKEN = '7816077588:AAGDkWz-cMmpj9p3pBEz88bak19O-ARlmG8'; // Replace with your bot token
const CHAT_ID = '7816077588'; // Replace with your chat ID

let lastUpdateId = 0; // Variable to track the last update ID

// Serve static files from the 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A presenter connected');

    socket.on('updateControlMessage', (data) => {

        io.emit('controlRoomMessage', data);
    });

    // Check for new Telegram messages every second
    setInterval(async () => {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
            // Process each message
            for (const item of data.result) {
                const messageText = item.message.text;

                // Check if the message is valid (not a command)
                if (!messageText.startsWith('/')) {
                    io.emit('telegramMessage', messageText); // Emit the valid message
                }

                // Update lastUpdateId to the current message ID
                lastUpdateId = item.update_id; // Update to the last processed update ID
            }
        }
    }, 1000); // Check for new messages every second
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3002');
});
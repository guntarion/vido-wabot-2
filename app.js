const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const messageRoutes = require('./routes/messageRoutes');
const healthRoute = require('./routes/healthRoute');
const client = require('./whatsapp/waclient');

const app = express();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());

// Mount routes
app.use('/api', messageRoutes);
app.use('/api', healthRoute);

// Initialize WhatsApp client
client.initialize();

http.createServer(app).listen(port, () => {
    console.info('Server listening on port ' + port);
});

module.exports = app;

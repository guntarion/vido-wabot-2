const express = require('express');
const router = express.Router();
const client = require('../whatsapp/waclient');

router.post('/send-message', (req, res) => {
    const { number, text } = req.body;
    const chatId = number.substring(1) + '@c.us';
    client.sendMessage(chatId, text);
    res.send({ status: 'Message sent' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

const { sendMessage, sendMessages } = require('../whatsapp/sendMessage');

// Health check route
router.get('/health', (req, res) => {
    console.log('Server is running healthy =====');
    res.json({ success: true, message: 'Server is running healthy' });
});

/*
This route also reads the chatsData.json file and parses the JSON data,
but instead of rendering a view, it sends the parsed data as a JSON response.
This is an API endpoint that can be used by client-side JavaScript or other clients to fetch the chat data.
*/
router.get('/chats', (req, res) => {
    const chatsPath = path.join(__dirname, '../src/chatsData.json');
    // console.log('chatsPath =====', chatsPath);
    fs.readFile(chatsPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res
                .status(500)
                .send(
                    'An error occurred while reading the chatsData.json file.'
                );
        }
        res.json(JSON.parse(data));
    });
});

router.post('/message', async (req, res) => {
    const { chatContent, lastSender } = req.body;

    const completion = await openai.chat.completions.create({
        messages: [
            { 
                role: 'system', 
                content: lastSender === 'Clients' 
                    ? 'Anda adalah customer service yang ramah dari Vido Garment, perusahaan yang bergerak di pembuatan seragam. Tugas Anda adalah memberi respon atas pesan terakhir yang disampaikan Client. Perhatikan isi percakapan sebelum-sebelumnya, untuk memahami konteksnya.' + chatContent 
                    : 'Anda adalah customer service yang ramah dari Vido Garment, perusahaan yang bergerak di pembuatan seragam. Tugas Anda adalah melanjutkan pesan yang sudah disampaikan Customer Service. Perhatikan isi percakapan sebelum-sebelumnya, untuk memahami konteksnya.' + chatContent 
            },
        ],
        model: 'gpt-3.5-turbo',
    });

    res.json({ message: completion.choices[0].message.content });
});

router.post('/send-message', sendMessage);
router.post('/send-messages', sendMessages);

module.exports = router;
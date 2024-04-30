const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Page routes
router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

/*
This route reads the chatsData.json file, parses the JSON data, and then renders the 'chats' view with the parsed data. 
This is used to display the chat data on a webpage.
*/
router.get('/chats', (req, res) => {
    const chatsPath = path.join(__dirname, '../src/chatsData.json');
    fs.readFile(chatsPath, 'utf8', async (err, data) => {
        if (err) {
            console.error(err);
            return res
                .status(500)
                .send('An error occurred while reading the chats.json file.');
        }
        const chats = JSON.parse(data);

        res.render('chats', {
            title: 'Chats',
            chats: chats,
        });
    });
});

// Additional routes for datachat, pages, forms
router.get('/datachat', (req, res) => {
    res.render('datachat', { title: 'Data Chat' });
});

router.get('/pages', (req, res) => {
    res.render('pages', { title: 'Pages' });
});

router.get('/forms', (req, res) => {
    res.render('forms', { title: 'Forms' });
});

router.get('*', (req, res) => {
    res.render('404', { title: '404' });
});

module.exports = router;

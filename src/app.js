const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const { engine } = require('express-handlebars');
require('dotenv').config();


// const healthRoute = require('./routes/healthRoute');
// const messageRoutes = require('./routes/messageRoutes');
const client = require('../whatsapp/waclient');
const viewRoutes = require('../routes/viewRoutes');
const apiRoutes = require('../routes/apiRoutes');

const app = express();
const port = process.env.PORT || 3002;

// Body parser middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Setup handlebars engine and views location
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');
const layoutsPath = path.join(__dirname, '../templates/layouts');

// console.log('viewsPath =====', viewsPath);

app.engine(
    'hbs',
    engine({
        extname: 'hbs', // sets the extension name to .hbs
        defaultLayout: 'main', // sets the default layout to main.hbs
        layoutsDir: layoutsPath, // path to layouts folder
        partialsDir: partialsPath, // path to partials folder
        helpers: {
            truncate: function (str, numWords) {
                var words = str.split(' ');
                if (words.length > numWords) {
                    words = words.slice(0, numWords);
                    return words.join(' ') + '...';
                }
                return str;
            },
        },
    })
);
app.set('view engine', 'hbs');
app.set('views', viewsPath);

// Static files
const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));


// Mount routes
// app.use('/api', messageRoutes);
// app.use('/api', healthRoute);
app.use('/api', apiRoutes);  // Includes messageRoutes, healthRoute
app.use(viewRoutes);  // Routes for serving HTML pages

// Initialize WhatsApp client
// client.initialize();

http.createServer(app).listen(port, () => {
    console.info('Server listening on port ' + port);
});

module.exports = app;

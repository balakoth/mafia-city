const fs = require('fs');

global.server = {};

const { initComponents } = require("./init");

if (!fs.existsSync(`${__dirname}/config.json`)) {
    // no config.. add some console log or logger?;
    process.exit(0);
} else {
    server.config = require('./config.json');
}
// Move to Json
global.MAX_PLAYERS = 5;
global.Path = __dirname;

// Setup DB
server.db = require('./system/db');
server.validate = require('./system/db/validate');

server.db.Connect(function() {
    console.log("Good to go...");
});

initComponents();
// Load future components "dynamically"
// Makes use of node package require-all
module.exports = {
    initComponents: function() {
        var components = require('require-all')({
            dirname: __dirname + '/components',
            filter: /^(index)\.js$/
        });
        console.log("Loading.. Comps");
    }
}
// Basic mySQL setup and connection base... extend further
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs'); // encryption 

module.exports = {
    Handle: null,
    Connect: function(callback) {
        this.Handle = mysql.createConnection({ host: server.config.host, user: server.config.user, password: server.config.password, database: server.config.database });

        this.Handle.connect(function(err) {
            if (!err) {
                console.log('Connected to Database')
                callback();
            } else { // base Error returns
                switch (err.code) {
                    case 'PROTOCOL_CONNECTION_LOST':
                        console.log('Database connection was closed.');
                        break;
                    case 'ER_CON_COUNT_ERROR':
                        console.log('Close a server.');
                        break;
                    case 'ECONNREFUSED':
                        console.log('Refused Conn');
                        break;
                    case 'ER_BAD_DB_ERROR':
                        console.log('The database name you\'ve entered does not exist.');
                        break;
                    case 'ER_ACCESS_DENIED_ERROR':
                        console.log('username/password invalid.');
                        break;
                    case 'ENOENT':
                        console.log('Connection NULL.');
                        break;
                    case 'ENOTFOUND':
                        console.log('Database host not found.');
                        break;
                    default:
                        console.log(err);
                        break;
                }
            }
        });
    }
};

// Notify connecction state and handle
mp.events.add('sendConnectionState', (player, username, pass, state) => {
    let loginUser = mp.players.toArray().find(p => p.loggedInAs == username);
    /*
     *  0 : Login  
     *  1 : Create / Register
     * 
     */
    switch (state) {
        case 0: // Login
            {
                if (loginUser) {
                    console.log('Logged in already.');
                    player.call('loginHandler', ['logged']);
                } else {
                    server.db.Handle.query('SELECT `password` FROM `users` WHERE `username` = ?', [username], function(err, result) {
                        if (result.length > 0) {
                            let sqlPassword = result[0]['password'];
                            bcrypt.compare(pass, sqlPassword, function(err, result2) {
                                if (result2 === true) {
                                    console.log(player.name);
                                    player.name = username;
                                    player.call('loginHandler', ['success']);
                                    server.validate.load(player);
                                } else {
                                    player.call('loginHandler', ['incorrectLogin']);
                                }
                            });
                        } else {
                            player.call('loginHandler', ['incorrectLogin']);
                        }
                    });
                }
                break;
            }
        case 1: // Create
            {
                if (username.length >= 3 && pass.length >= 5) {
                    server.db.Handle.query('SELECT * FROM `users` WHERE `username` = ?', [username], function(err, result) {
                        if (result.length > 0) {
                            player.call('loginHandler', ['registerLogin']);
                        } else {
                            bcrypt.hash(pass, null, null, function(err, hash) {
                                if (!err) {
                                    server.db.Handle.query('INSERT INTO `users` SET username = ?, password = ?', [username, hash], function(err, result) {
                                        if (!err) {
                                            player.name = username;
                                            player.call('loginHandler', ['registered']);
                                            server.validate.registerUser(player);
                                            console.log(username + ' registered.');
                                        } else {
                                            console.log('Register:' + err)
                                        }
                                    });
                                } else {
                                    console.log('Crypt Error' + err)
                                }
                            });
                        }
                    });
                } else {
                    player.call('loginHandler', ['short']);
                }
                break;
            }
        default:
            {
                console.log('State error. State: ' + state)
                break;
            }
    }
});

mp.events.add('playerQuit', (player) => {
    if (player.loggedInAs != '') {
        server.validate.save(player);
    }
});

mp.events.add('playerJoin', (player) => {
    console.log(`${player.name} has joined. [${player.id}]`);
    player.loggedInAs = '';
});
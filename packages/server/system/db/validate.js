module.exports = {
    register: function(player) {
        player.data.money = 1;
        player.position = new mp.Vector3(15, 15, 71); // defaults found some a tut
        player.health = 100;
        player.loggedInAs = player.name;
    },
    load: function(player) {
        var query = 'SELECT * FROM `users` WHERE `username` = "' + player.name + '"';
        server.db.Handle.query('SELECT * FROM `users` WHERE `username` = ?', [player.name], function(err, result) {
            if (result.length > 0) {
                console.log(`${player.name} inside load`);
                console.log(`${result[0]['health']} inside load`);
                // player.health = 100;
                player.uid = result[0]['id'];
                player.name = result[0]['username'];
                player.data.money = result[0]['money'];
                player.position = new mp.Vector3(result[0]['posX'], result[0]['posY'], result[0]['posZ']);
                player.health = result[0]['health'];
                player.loggedInAs = result[0]['username'];
                player.stereoVolume = result[0]['stereoVolume'];
                player.setVariable('stationName', null);
                // player.setVariable(stereoVolume, result[0]["stereoVolume"]);
                console.log(`${player.name} ${player.uid} has logged in`);
            }
            console.log(query, player.data.money, player.health);
        });

    },
    save: function(player) {
        server.db.Handle.query('UPDATE `users` SET money = ?, posX = ?, posY = ?, posZ = ?, health = ? WHERE `username` = "?"', [player.data.money, player.position.x.toFixed(2), player.position.y.toFixed(2), player.position.z.toFixed(2), player.health, player.name], function(err, res, row) {
            if (err) console.log(err);
        });
    }
}

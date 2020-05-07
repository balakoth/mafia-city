// Base spectate system

mp.events.addCommand("spectate", (player, fullText, param1) => {

    if (param1 == 'off') {
        // Set back to default
        player.call("spectateReset");
        player.notify("~b~ You are no longer spectating ");
    } else {
        console.log(param1);
        var _player = mp.players.at(parseInt(param1));
        if (_player) {
            player.call("spectateToID", _player.handle);
            player.notify("Spectate Command Entry");
            console.log("Found");
        }
        // let target = mp.players.at(param1);
    }

    console.log("Simple Command");
});
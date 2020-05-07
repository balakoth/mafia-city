let sStream = null;

const localPlayer = mp.players.local;
let currentStation;

mp.events.add('render', () => {
    if (currentStation) {
        mp.game.graphics.drawText(currentStation, [0.5, 0.06], {
            font: 4,
            color: [255, 187, 101, 185],
            scale: [0.6, 0.6],
            outline: true
        });
    }
});

mp.events.addDataHandler('stationName', (entity, newStation, oldStation) => {
    if (entity && entity.remoteId === localPlayer.remoteId && newStation !== oldStation) {
        currentStation = newStation;
    }
});

mp.events.add({
    // Client side interface open, show UI and execute client side javascript for audio tag
    "sStreamStart": (station, name) => {
        mp.gui.chat.push(`[${localPlayer.remoteId}]`);
        mp.game.graphics.notify("Entering stream for station:" + station);
        sStream = mp.browsers.new('package://stereo/index.html');
        sStream.execute(`setStation("${station}", "${name}");`);
    },
    // Just blow that browser up
    "sStreamStop": (lang, inject) => {
        sStream.destroy();
        sStream = null;
    },
    // Change our station (pause was required, stop not working?!)
    "sStreamChange": (station, name) => {
        sStream.execute(`changeStation("${station}", "${name}");`);
    },

    // currently unsued due to unexpected result
    "sStreamOff": (value) => {
        sStream.execute('stereoPowerPersonal(false);');
    },

    // currently unsued due to unexpected result
    "sStreamOn": (value) => {
        sStream.execute('stereoPowerPersonal(true);');
    }

});
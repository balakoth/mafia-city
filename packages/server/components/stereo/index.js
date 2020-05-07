// Listener controller constants
const STOP_ALL_LISTENERS = 0;
const START_ALL_LISTENERS = 1;
const RESTART_ALL_LISTENERS = 3;
const RENAME_ALL_LISTENERS = 4;

global.Stereos = [];

// See if player is in stereo collision (audio colshape) with ownership
//    Player object taken
//    returns: stereo object
function canControl(player) {
    var found = Stereos.find(function(uid) {
        return uid.uid == player.uid;
    });

    if (found.stereoLoc.isPointWithin(player.position)) return found;

    return null;
}

// Simple helper to control all listeners within a given stereo object
// stereo  : single stereo object
// doAction:
//       Constant to control execution within function to reduce redundancy
//
//       STOP_ALL_LISTENERS = 0;
//       START_ALL_LISTENERS = 1;
//       RESTART_ALL_LISTENERS = 3;
//       RENAME_ALL_LISTENERS = 4;
function controlAllListeners(stereo, doAction) {
    mp.players.forEach((playerListItem) => {
        if (stereo.stereoLoc.isPointWithin(playerListItem.position)) {
            switch (doAction) {
                case STOP_ALL_LISTENERS:
                    playerListItem.call("sStreamStop", []);
                    playerListItem.notify("Stereo stream stopped..");
                    playerListItem.setVariable("stationName", "");
                    break;
                case START_ALL_LISTENERS:
                    playerListItem.call("sStreamStart", [
                        stereo.station,
                        stereo.stationName,
                    ]);
                    playerListItem.notify("Stereo stream started..");
                    playerListItem.setVariable("stationName", stereo.stationName);
                    console.log(stereo.station, stereo.power, stereo.stationName);
                    break;
                case RESTART_ALL_LISTENERS:
                    playerListItem.notify("Stereo stream changing stations..");
                    playerListItem.call("sStreamChange", [
                        stereo.station,
                        stereo.stationName,
                    ]);
                    playerListItem.setVariable("stationName", stereo.stationName);
                    break;
                case RENAME_ALL_LISTENERS:
                    playerListItem.setVariable("stationName", stereo.stationName);
                    break;
            }
        }
    });
}

// load all the stereos from the Database
server.db.Handle.query("SELECT * FROM stereos", function(err, result) {
    if (result.length < 0) {
        console.log("No stereos found");
        return;
    }

    console.log("Found some stereoes " + result.length);
    let query = new Promise(function(resolve, reject) {
        result.forEach((stereoNew, index) => {
            let object = {
                index: index,
                id: stereoNew.id,
                uid: stereoNew.owner,
                stationName: stereoNew.name,
                stereoLoc: mp.colshapes.newSphere(
                    stereoNew.x,
                    stereoNew.y,
                    stereoNew.z,
                    10,
                    0
                ),
                stereoControl: mp.colshapes.newSphere(
                    stereoNew.useX,
                    stereoNew.useY,
                    stereoNew.useZ,
                    2.0,
                    0
                ),
                stereoMarker: mp.markers.new(
                    0,
                    new mp.Vector3(stereoNew.useX, stereoNew.useY, stereoNew.useZ),
                    2.0, {
                        color: [255, 255, 0, 150],
                        direction: 0,
                        dimension: 0,
                        visible: true,
                    }
                ),
                station: stereoNew.stationLink,
                power: true,
            };

            Stereos.push(object);
        });
        resolve(Stereos.length);
    });
});

// Enter and check colshape for stereo and turn on the radio if possible with station name for render
function playerEnterColshapeHandler(player, shape) {
    Stereos.forEach((stereoList) => {
        if (stereoList.stereoLoc == shape) {
            if (stereoList.power == true) {
                player.setVariable("stationName", stereoList.stationName);
                player.notify("Stereo stream started..");
                player.call("sStreamStart", [
                    stereoList.station,
                    stereoList.stationName,
                ]);
                console.log(
                    stereoList.station,
                    stereoList.power,
                    stereoList.stationName
                );
            }
        }
    });
}
mp.events.add("playerEnterColshape", playerEnterColshapeHandler);

// Exit and check colshape for stereo and turn off radio - Clear station name for render
function playerExitColshapeHandler(player, shape) {
    Stereos.forEach((stereoList) => {
        if (stereoList.stereoLoc != shape || stereoList.power != true) {
            return;
        }

        player.setVariable("stationName", "");
        player.notify("Stereo stopped");
        player.call("sStreamStop", []);
    });
}
mp.events.add("playerExitColshape", playerExitColshapeHandler);

// Stereo Ownership handling // Djs??
mp.events.addCommand("stereo", (player, fullText, param1, param2) => {
    let control = canControl(player);
    if (control == null) {
        console.log("No stereo to control.");
        return;
    }
    if (!control.stereoControl.isPointWithin(player.position) && param1 != "setcontrol") {
        player.notify("~y~ Not here.  Get to the controls!");
        return;
    }

    switch (param1) {
        case "setcontrol":
            control.stereoControl.position = player.position;
            control.stereoMarker.position = player.position;
            player.notify("~y~ New control location set..");
            break;
        case "off":
            if (control.power == false) {
                player.notify("~b~ Stereo is already off!");
                return;
            }
            player.notify("~b~ Stereo is now off!");
            player.setVariable("stationName", "");
            controlAllListeners(control, STOP_ALL_LISTENERS);
            control.power = false;
            break;
        case "on":
            if (control.power == true) {
                player.notify("~b~ Stereo is already on!");
                return;
            }
            player.notify("~b~ Stereo is now on!");
            controlAllListeners(control, START_ALL_LISTENERS);
            control.power = true;
            break;
        case "station":
            if (param2 == null || param2 == "") {
                player.notify("~y~ You need a station address! (HTTP://)");
                return;
            }
            control.station = param2;
            if (control.power == true) {
                controlAllListeners(control, RESTART_ALL_LISTENERS); // Restart all found players.   Using pause() / play() timeline = 0 javascript call
            }

            break;
        case "stationname":
            if (param1 == null || param1 == "") {
                player.notify("~y~ You need to supply a name for the station!");
                return;
            }

            var stationName = fullText.substring(param1.length + 1);
            control.stationName = stationName;
            if (control.power == true) {
                controlAllListeners(control, RENAME_ALL_LISTENERS); // Rename everyone ones setVar
            }

            break;
        default:
            player.notify("~y~ You cannot control a stereo from here.");
            break;
    }
});

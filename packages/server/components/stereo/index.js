// Listener controller constants
const STOP_ALL_LISTENERS = 0;
const START_ALL_LISTENERS = 1;
const RESTART_ALL_LISTENERS = 3;
const RENAME_ALL_LISTENERS = 4;


global.Stereos = [];

// Find the stereo based on colshape object passed
//    null = not found;
//    returns:  stereo object
function findStereoByCol(currCol) {
    Stereos.forEach((stereoList) => {
        if (stereoList.stereoLoc == currCol) {
            return stereoList;
        }
    });
    return null;
}


// See if player is in stereo collision (audio colshape) with ownership
//    Player object taken
//    returns: stereo object
function canControl(player) {
    var found = Stereos.find(function(uid) {
        return uid.uid == player.uid;
    });

    if (found.stereoLoc.isPointWithin(player.position))
        return found;

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
                    playerListItem.call('sStreamStop', []);
                    playerListItem.notify('Stereo stream stopped..');
                    playerListItem.setVariable('stationName', '');
                    break;
                case START_ALL_LISTENERS:
                    playerListItem.call('sStreamStart', [stereo.station, stereo.stationName]);
                    playerListItem.notify('Stereo stream started..');
                    playerListItem.setVariable('stationName', stereo.stationName);
                    console.log(stereo.station, stereo.power, stereo.stationName);
                    break;
                case RESTART_ALL_LISTENERS:
                    playerListItem.notify('Stereo stream changing stations..');
                    playerListItem.call('sStreamChange', [stereo.station, stereo.stationName]);
                    playerListItem.setVariable('stationName', stereo.stationName);
                    break;
                case RENAME_ALL_LISTENERS:
                    playerListItem.setVariable('stationName', stereo.stationName);
                    break;
            }
        }
    });
}


// load all the stereos from the Database
server.db.Handle.query('SELECT * FROM stereos', function(err, result) {
    console.log('Finding Stereo');
    if (result.length > 0) {
        console.log('Found some stereoes ' + result.length);
        let query = new Promise(function(resolve, reject) {
            result.forEach((stereoNew, index) => {
                let object = {
                    index: index,
                    id: stereoNew.id,
                    uid: stereoNew.owner,
                    stationName: stereoNew.name,
                    stereoLoc: mp.colshapes.newSphere(stereoNew.x, stereoNew.y, stereoNew.z, 10, 0),
                    stereoControl: mp.colshapes.newSphere(stereoNew.useX, stereoNew.useY, stereoNew.useZ, 2.0, 0),
                    stereoMarker: mp.markers.new(0, new mp.Vector3(stereoNew.useX, stereoNew.useY, stereoNew.useZ), 2.0, {
                        'color': [255, 255, 0, 150],
                        'direction': 0,
                        'dimension': 0,
                        'visible': true
                    }),
                    station: stereoNew.stationLink,
                    power: true
                };

                Stereos.push(object);
            });
            resolve(Stereos.length);
        });
    }
});


function playerEnterColshapeHandler(player, shape) {
    Stereos.forEach((stereoList) => {
        if (stereoList.stereoLoc == shape) {
            if (stereoList.power == true) {
                player.setVariable('stationName', stereoList.stationName);
                player.notify('Stereo stream started..');
                player.call('sStreamStart', [stereoList.station, stereoList.stationName]);
                console.log(stereoList.station, stereoList.power, stereoList.stationName);
            }
        }
    });

}
mp.events.add('playerEnterColshape', playerEnterColshapeHandler);

function playerExitColshapeHandler(player, shape) {
    Stereos.forEach((stereoList) => {
        if (stereoList.stereoLoc == shape) {
            if (stereoList.power == true) {
                player.setVariable('stationName', '');
                player.notify('Stereo stopped');
                player.call('sStreamStop', []);
            }
        }
    });
}
mp.events.add('playerExitColshape', playerExitColshapeHandler);



mp.events.addCommand('stereo', (player, fullText, param1, param2) => {
    let control = canControl(player);
    if (control != null) {
        if (param1 == 'setcontrol') {
            if (!control.stereoControl.isPointWithin(player.position)) {
                control.stereoControl.position = player.position;
                control.stereoMarker.position = player.position;
                player.notify('~y~ New control location set..');
            }
        } else if (param1 == 'off') { // Turn stream off for EVERYONE -- Will not start until turned on
            if (control.power == false) {
                player.notify('~b~ Stereo is already off!');
                return;
            }
            player.notify('~b~ Stereo is now off!');
            player.setVariable('stationName', '');
            controlAllListeners(control, STOP_ALL_LISTENERS);
            control.power = false;
        } else if (param1 == 'on') { // Turn on stream 
            if (control.power == true) {
                player.notify('~b~ Stereo is already on!');
                return;
            }
            // player.call('sStreamOn', []);
            player.notify('~b~ Stereo is now on!');
            controlAllListeners(control, START_ALL_LISTENERS);
            control.power = true;
        } else if (param1 == 'station') {
            if (param2 != null || param2 != "") {
                control.station = param2;
                //var array = arguments;
                //array.shift();
                // control.stationName = 
                if (control.power == true) {
                    controlAllListeners(control, RESTART_ALL_LISTENERS);
                }
            } else {
                player.notify('~y~ You need a station address! (HTTP://)');
            }
        } else if (param1 == 'stationname') {
            if (param1 != null || param1 != "") {
                var stationName = fullText.substring(param1.length + 1);
                control.stationName = stationName;

                if (control.power == true) {
                    controlAllListeners(control, RENAME_ALL_LISTENERS);
                }
            } else {
                player.notify('~y~ You need to supply a name for the station!');
            }
        } else {
            player.notify('~y~ You cannot control a stereo from here.');
        }
    } else {
        console.log('You might be dumb');
    }
});

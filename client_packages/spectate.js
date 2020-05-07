mp.events.add("spectateToID", (playerTo) => {
    let sceneryCamera = mp.cameras.new('default');
    console.log("End player call");
    //mp.game.cam.setActive(false);


    //sceneryCamera.attachToPedBone(player, 0, 0, 0, 0, true);
    sceneryCamera.attachTo(playerTo, 0, 0, 0, 25.0, 0, 0, 0, true, false, false, false, 0, true);
    sceneryCamera.setActive(true);

    //sceneryCamera.pointAtCoord(402.8664, -996.4108, -98.5);
    //sceneryCamera.setCoord(player.position.x + 1, player.position.y + 1, player.position.z);
    mp.game.cam.renderScriptCams(true, false, 0, true, false);

});

mp.events.add("spectateReset", (id) => {
    mp.game.cam.renderScriptCams(false, false, 0, true, false);
});
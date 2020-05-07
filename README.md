# mc-probie
Mafia City Application Source


To whom it may concern,

This is my submission per request for a Streaming "Radio system" for Mafia City: RageMP

Please understand this is a prototype, and I Feel I could have put another full hard week into completing it fully and adding additional features.      On top of that, permission systems, buy systems etc would be easily adaptable based on learning the Mafia City structure and wrappers.  

The vanilla base posted here is what I run to test as well as the code for the application.  I utilized a premade HTML page (I did not write the html) with bootstrap and jquery as well as learning from example to develop a mysql login register system, using a basic setup I have used for previous nodeJS projects myself.    I did this in order to learn the client/server setup of ragemp as well as provide additional support for "testing" systems for the stereo streamer.

Currently the code provided demonstrates: loading X number of steroes from a SQL database, with locations, control locations and basic UID ownership and Name columns.

Each colshape provides a diff stream based on ID, and owners of each colshape may start, stop streams that effect all client side users, as well as change streaming stations; which force all users within the stereo colshape to reload their stream and also Game rendered text to display the station name based on database loaded data. 

Entering a colshape starts a stream, exiting leaves it... all owner actions affect players inside the stereo colshape.  

Notes:
PLease disgegard any stray console.log, as I have an odd way of debugging when not using LINT.


Best regards,
Joseph Crenshaw


TODO:
 - Fade stereo distance volume?  (if possible) by distance from colshape center
 - restyle default audio tag.  Disable controls, add mafia city stylized buttons
 - create check distance function from center to center of new creation (for future buy points) making sure distance is +10 apart while respecting dimension  (for possible festivals?    Buildings next to each other with stereoes etc

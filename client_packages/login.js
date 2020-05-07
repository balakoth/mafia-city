var loginBrowser = mp.browsers.new("package://login/index.html");
mp.gui.cursor.show(true, true);


mp.events.add("loginDataToServer", (user, pass, state) => {
    mp.events.callRemote("sendConnectionState", user, pass, state);
});


// Handle login states
mp.events.add("loginHandler", (handle) => {
    switch (handle) {
        case "success":
            {
                loginBrowser.destroy();
                mp.gui.chat.push("Login successful");
                mp.gui.chat.activate(true);
                mp.gui.cursor.show(false, false);
                break;
            }
        case "registered":
            {
                loginBrowser.destroy();
                mp.gui.chat.push("Registration successful");
                mp.gui.chat.activate(true);
                mp.gui.cursor.show(false, false);
                break;
            }
        case "incorrectLogin":
            {
                loginBrowser.execute(`$(".incorrect-info").show(); $("#loginBtn").show();`);
                break;
            }
        case "loginRegister":
            {
                loginBrowser.execute(`$(".taken-info").show(); $("#registerBtn").show();`);
                break;
            }
        case "short":
            {
                loginBrowser.execute(`$(".short-info").show(); $("#registerBtn").show();`);
                break;
            }
        case "logged":
            {
                loginBrowser.execute(`$(".logged").show(); $("#loginBtn").show();`);
                break;
            }
        default:
            {
                mp.gui.chat.push("unhandled state error");
                break;
            }
    }
});
const ipc = require("electron").ipcRenderer;

console.info(">>> setting page handle start...");

ipc.on('settingData', (event, args) => {
    console.info("setting json: " + args.toString());
    const settingJson = JSON.parse(args.toString());
    document.getElementById('pid_server').value = settingJson.server;
    document.getElementById('pid_email').value = settingJson.email;
    document.getElementById('pid_password').value = settingJson.password;
});

function writeSettings() {
    ipc.send('giveMeSetting', '');
}

function closeSettings () {
    console.info("close settings page ...");
    ipc.send('closeSettings', '');
}

function onSubmit() {
    let settings2 = {
        server: document.getElementById('pid_server').value,
        email: document.getElementById('pid_email').value,
        password: document.getElementById('pid_password').value,
        number: 25
    };
    ipc.send('onSubmit', JSON.stringify(settings2));
    console.info("server: " + settings2.server);
    console.info("email: " + settings2.email);
    console.info("password: " + settings2.password);
    closeSettings();
}
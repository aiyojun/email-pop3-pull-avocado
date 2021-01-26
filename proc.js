const fs = require('fs');

const proc = {
    emailsJson: null,
    maxUUID: 0,
    pullEmails: function (mainWindow, _server, _email, _password, _number) {
        console.info(">> do pull ...");
        const spawn = require('child_process').spawn;
        const child = spawn(__dirname + '/script/pop3_pull.bat', [_email, _password, _server, _number.toString()]);
        if (process.platform === "win32") {
            child.on('exit', () => {
                pack(mainWindow);
            });
            return;
        }
        let changed = false;
        child.stdout.on('data', (data) => {
            proc.emailsJson = new Map();
            let dataJson = data.toString();
            console.info("json: " + dataJson);
            let emails = JSON.parse(dataJson).emails;
            for (let idx in emails) {
                let emailOneJson = emails[idx];
                if (emailOneJson.uuid > proc.maxUUID) {
                    proc.maxUUID = emailOneJson.uuid;
                    changed = true;
                    console.info("do pull ...");
                }
                proc.emailsJson.set(emailOneJson.uuid, emailOneJson);
            }
            if (changed) {
                console.info("Received a new email!");
                mainWindow.webContents.send('emailsJson', dataJson);
            } else {
                mainWindow.webContents.send('emailsJson2');
            }
        });
        child.stderr.on('data', (data) => {
            console.error(data.toString());
        });
        console.info("<< do pull over");
    }
};

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, {flag: 'r+', encoding: 'utf8'}, (err, data) => {
            if (err) console.error(err);
            resolve(data);
        })
    });
}

const pack = async (mainWindow) => {
    console.info(">> -1");
    const data = await readFile('pipe');
    proc.emailsJson = new Map();
    let dataJson = data.toString();
    // console.info("json: " + dataJson);
    let emails = JSON.parse(dataJson).emails;
    let changed = false;
    for (let idx in emails) {
        let emailOneJson = emails[idx];
        if (emailOneJson.uuid > proc.maxUUID) {
            proc.maxUUID = emailOneJson.uuid;
            console.info(emailOneJson.uuid);
            changed = true;
            console.info("do pull ...");
        }
        proc.emailsJson.set(emailOneJson.uuid, emailOneJson);
    }
    // console.info(dataJson);
    if (changed) {
        console.info("sending emailJson 1");
        console.info("Received a new email!");
        mainWindow.webContents.send('emailsJson', dataJson);
    } else {
        console.info("sending emailJson 2");
        mainWindow.webContents.send('emailsJson2');
    }
};

module.exports = proc;
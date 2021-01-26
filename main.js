const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const task = require('./proc');
const fs = require('fs');

console.info("start main.js");

const localContext = {
  settingPage: null,
  mainWindow: null,
  emailWindow: null,
  emailUUID: null,
  settings: {
    server: "172.16.1.233",
    email: "daijun@jabqus.com",
    password: "suzhou12345",
    number: 25,
  }
};

const iconPath = 'resources/avocado.png';

let settingOpened = false;

function createWindow () {
  const { screen } = require('electron');

  const win = new BrowserWindow({
    icon: iconPath,//__dirname + '/resources/avocado.png',
    width: 350,
    height: screen.getPrimaryDisplay().workAreaSize.height,
    x: screen.getPrimaryDisplay().workAreaSize.width - 350,
    y: 0,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.setIcon(nativeImage.createFromPath(iconPath));
  // console.info(__dirname + '/resources/icon.png');
  // if (process.platform === "darwin") {
  // console.info(__dirname + '/resources/avocado.png');
  //   app.dock.setIcon(__dirname + '/resources/avocado.png');
  // }
  win.loadFile('index.html');
  // win.webContents.openDevTools({
  //   mode: 'bottom'
  // });
  localContext.mainWindow = win;
  fs.exists('cache', (exists) => {
    if (exists) {
      fs.readFile('cache', (err, data) => {
        // console.info("read context: " + data.toString());
        localContext.settings = JSON.parse(data.toString());
        // console.info("update setting data: " + JSON.stringify(localContext.settings));
        // localContext.mainWindow.webContents.send('settingData', data.toString());
      })
    }
  });
}

ipcMain.on('closeApp', () => {
  localContext.mainWindow.close();
});

ipcMain.on('closeEmailPage', () => {
  if (localContext.emailWindow) {
    localContext.emailWindow.close();
    localContext.emailWindow = null;
  }
});

ipcMain.on('createEmailPage', (event, args) => {
  console.info("email: " + args);
  localContext.emailUUID = Number.parseInt(args);
  if (localContext.emailWindow) {
    localContext.emailWindow.close();
    localContext.emailWindow = null;
  }
  const { screen } = require('electron');
  let page2 = new BrowserWindow({
    width: 800,
    height: 300,
    // height: 180 * 4,
    x: (screen.getPrimaryDisplay().workAreaSize.width - 800) / 2,
    y: 200,
    // resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  page2.loadFile('email.html');
  localContext.emailWindow = page2;
  // console.info(task.emailsJson);
  // console.info(task.emailsJson.get(emailUUID));
  // if (task.emailsJson.get(emailUUID).hasOwnProperty('plain')) {
  //   console.info("--> " + task.emailsJson.get(emailUUID).plain);
  //   localContext.emailWindow.webContents.send('fill', task.emailsJson.get(emailUUID).plain);
  //   console.info("-->  send over!");
  // } else {
  //   localContext.emailWindow.webContents.send('fill', "Empty email.");
  // }
});


ipcMain.on('doFill', () => {
  if (task.emailsJson.get(localContext.emailUUID).hasOwnProperty('plain')) {
    // console.info("--> " + task.emailsJson.get(localContext.emailUUID).plain);
    localContext.emailWindow.webContents.send('fill', task.emailsJson.get(localContext.emailUUID).plain);
    // console.info("-->  send over!");
  } else {
    localContext.emailWindow.webContents.send('fill', "Empty email.");
  }
});

ipcMain.on('openSettings', (event, status) => {
  if (settingOpened) {return;}
  settingOpened = true;
  const { screen } = require('electron');
  page = new BrowserWindow({
    width: 300,
    height: 180,
    // height: 180 * 4,
    x: screen.getPrimaryDisplay().workAreaSize.width - 310 + 5,
    y: 70,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  page.loadFile('settings.html');
  // page.webContents.openDevTools({
  //   mode: 'bottom'
  // });
  localContext.settingPage = page;
  localContext.settingPage.webContents.send('settingData', JSON.stringify(localContext.settings));
});

ipcMain.on('closeSettings', () => {
  localContext.settingPage.close();
  settingOpened = false;
});

ipcMain.on('giveMeSetting', () => {
  localContext.settingPage.webContents.send('settingData', JSON.stringify(localContext.settings));
});

ipcMain.on('doPull', () => {
  task.pullEmails(
      localContext.mainWindow,
      localContext.settings.server,
      localContext.settings.email,
      localContext.settings.password,
      localContext.settings.number);
});

ipcMain.on('onSubmit', (event, args) => {
  fs.writeFile('cache', args.toString(), (err) => {
    if (err) {
      throw err;
    }
    console.info("write file complete!")
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

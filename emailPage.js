console.info("start email page js ...");

const ipc = require("electron").ipcRenderer;

function doFill() {
    ipc.send('doFill');
}

ipc.on('fill', (event, args) => {
    console.info("fill --> " + args);
    document.getElementById('root').innerText = args;
    // document.getElementById('root').innerHTML = args;
});

function closeEmailPage() {
    ipc.send('closeEmailPage')
}

// define global vars
const {app, BrowserWindow, Menu} = require('electron'); // load modules from electron
const path = require('path');
const url = require('url');
const shell = require('electron').shell;
const ipcMain = require("electron").ipcMain; // electron inter-process communication (ipcMain / ipcRenderer) 

// default currency vars to USD
var currency = 'USD';
var currSymbol = '$'

// global ref to window object (avoid JS garbage collection)
let win;

function createWindow() {

    // create window object
    win = new BrowserWindow({width: 800, height: 600});

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'src/index.html'),
        protocol: 'file',
        slashes: true
    }));

    // open devtools [Chrome]
    // win.webContents.openDevTools();

    // window close emitter
    win.on('closed', () => {
        win = null;
    });

    // build toolbar menu (passed as array)
    var menu = Menu.buildFromTemplate([
        {
            label: 'Menu', // header task
            submenu: [ // dropdown task(s)
                {
                    label: 'Adjust Notification Value',
                    click() {
                        const focusedWindow = BrowserWindow.getFocusedWindow();
                        focusedWindow.webContents.send('open-addWindow'); // same process as index.js
                    }
                },
                {
                    label: 'Load CoinMarketCap',
                    click() {
                        // navigate to specified URL in default browser
                        shell.openExternal('https://coinmarketcap.com');
                    }
                },
                // CD: built logic for toggling DevTools for js debugging outside main.js
                {
                    label: 'Toggle DevTools',
                    accelerator: process.platfrom == 'darwin' ? 'Command+I' : 'Ctrl+I',
                    click(item, focusedWindow){ // instantiate focus on open window
                        focusedWindow.toggleDevTools();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    click() {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Info',
            submenu: [ // dropdown task(s)
                {
                    label: 'Change Currency',
                    submenu: [ // sub-sub menu
                        {
                            label: 'USD ($)',
                            click() {
                                currency = 'USD';
                                const focusedWindow = BrowserWindow.getFocusedWindow();
                                focusedWindow.webContents.send('update-curr', currency);
                            }
                        },
                        {
                            label: 'EUR (€)',
                            click() {
                                currency = 'EUR';
                                const focusedWindow = BrowserWindow.getFocusedWindow();
                                focusedWindow.webContents.send('update-curr', currency);
                            }
                        }
                    ]
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
}

// called after Electron initialization
app.on('ready', createWindow);

// quit when all windows are closed
app.on('window-all-closed', () => {
    // darwin = macOS
    if (process.platform !== 'darwin') { app.quit(); }
});

app.on('activate', () => {
    if (win === null) { createWindow(); }
});

ipcMain.on('update-notify-val', function(event, arg) { // update-notify-val is the response event

    win.webContents.send('targetPriceVal', arg, currency);  // replace inner text with arg && pass currency

});
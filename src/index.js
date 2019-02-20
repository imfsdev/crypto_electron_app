const electron = require('electron'); // required for all js in electron app
const path = require('path');
const BrowserWindow = electron.remote.BrowserWindow; // allows for window creation
const axios = require('axios'); // import axios HTTP library (after installing to project ROOT)
const ipc = electron.ipcRenderer; // inter-process communication

// notify button
const notifyBtn = document.getElementById('notifyBtn');
// Axios HTTP
var price = document.querySelector('h1');
var targetPrice = document.getElementById('targetPrice');
var targetPriceVal; // set with ipc.on event
// currency values (default to US)
var currDisplay = document.getElementById('curr-display');
var currency = 'USD';
var currSymbol = '$';
var prevCurr = 'USD';

// notification settings
const notification = {
    title: 'BTC ALERT',
    body: 'BTC VALUE EXCEEDS SET TARGET PRICE',
    icon: path.join(__dirname, '../assets/images/btc.png')
}

// Axios HTTP library
// terminal > npm install axios --save
function getBTC() {

    // CryptoCompare API // dynmaic based on selected currency (USD || EUR)
    axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms='+currency+'&api_key=adbe9819d79d1e9fd801665a2fb6657fa318cb9e3bec611029d1b78d8380d9d6') // custom API key gained at https://cyrptocompare.com/api
        .then(res => { // task chaining

            // console.log(JSON.stringify(res)) // CD: debug
            const cryptos = (currency == 'USD') ? res.data.BTC.USD : res.data.BTC.EUR; // return data in selected currency

            // set the display props
            currDisplay.innerHTML = 'CURRENT BTC ('+currency+')';
            price.innerHTML = currSymbol + cryptos.toLocaleString('en');

            // eval if set target value is less than current BTC exchange value
            if (targetPrice.innerHTML !== '' && targetPriceVal < res.data.BTC.USD)
            {
                // NOTE: notifications currently do not work for Win10
                const appNotification = new window.Notification(notification.title, notification);
            }

        });
}
getBTC();
setInterval(getBTC, 30000); // run every 30s (30000ms)

// notify button event logic
notifyBtn.addEventListener('click', function(event) {

    const modalPath = path.join('file://', __dirname, 'add.html'); // retrieve path html
    let win = new BrowserWindow( // create window object
        { 
            frame:false, // remove toolbar menu
            transparent:true, // corrsponds to add.css html, body
            alwaysOnTop:true, 
            width:400, 
            height:200 
        });

    win.on('close', function() { win = null; });
    win.loadURL(modalPath); // load add.html as window
    win.show();

});

// set target price based on add.js response
ipc.on('targetPriceVal', function(event, arg, curr) { // targetPriceVal is the response event

    currency = curr; // global var
    targetPriceVal = tryParseInt(arg, 0); // attempt parse
    if (targetPriceVal > 0)
    {
        setCurrSymbol(curr);
        targetPrice.innerHTML = currSymbol + targetPriceVal.toLocaleString('en'); // set to the new target price && currency
    }
    else
    {
        arg = arg.replace(/\D/g, '') // regex search for all non-numeric chars
        targetPriceVal = tryParseInt(arg, 0); // attempt parse

        setCurrSymbol(curr);
        targetPrice.innerHTML = currSymbol + arg.toLocaleString('en'); // set to the new target price && currency
    }

    // reload if currency value changed
    if (prevCurr !== curr) { getBTC(); prevCurr = curr; /* global var */  }

});

// built similar to C#/Java int.TryParse() method
function tryParseInt(str, defVal)
{
    var retVal = defVal; // default val required
    if (str !== null)
    {
        if (str.length > 0)
        {
            if (!isNaN(str))
            {
                retVal = parseInt(str); // convert to int
            }
        }
    }
    return retVal;
}

// parse the correct symbol for the currency value selected
function setCurrSymbol(curr)
{
    if (curr == 'USD') { currSymbol = '$' }
    if (curr == 'EUR') { currSymbol = '€' }
}


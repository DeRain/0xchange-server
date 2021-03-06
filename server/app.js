var bodyParser = require('body-parser');
var cors = require('cors');
var CronJob = require('cron').CronJob;
var express = require('express');
var fs = require('fs');
var https = require('https');
var subdomain = require('express-subdomain');

var testnet = false;

var app = express();


app.use(bodyParser.json()); // for parsing application/json
app.use(cors());


// API Router
var router = express.Router();
//router.use(subdomain('kovan', require('../testnet/0xchange-server/server/router.js')));
//try {

//  testnet = true;
//  console.log('Running on kovan testnet.');
//} catch (err) {
//  console.log('Not using testnet');
//}

router.use('/', require('./router.js'));
console.log('Running on mainnet.');

app.use(subdomain('api', router));


// Configure server and start listening.
app.listen(3000, function() {
  console.log('HTTP Express server listening on port 3000.');
});
try {
  https.createServer({
    key: fs.readFileSync('privkey.pem'),
    cert: fs.readFileSync('fullchain.pem')
  }, app).listen(3001);
  console.log('HTTPS Express server listening on port 3001.');
} catch (err) {
  console.warn('HTTPS server failed.');
}


new CronJob({
  cronTime: '00 */5 * * * *',
  onTick: require('./scripts/purgeExpiredOrders.js'),
  start: true
});

if (testnet) {
  new CronJob({
    cronTime: '00 */5 * * * *',
    onTick: require('../testnet/0xchange-server/server/scripts/purgeExpiredOrders.js'),
    start: true
  });
}

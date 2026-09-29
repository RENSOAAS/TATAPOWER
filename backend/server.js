const https = require('https');
const fs = require('fs');
const app = require('./app');

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/tatapower.esys.co.in/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/tatapower.esys.co.in/fullchain.pem')
};

const port = process.env.PORT || 8000;

https.createServer(options, app).listen(port, () => {
    console.log('Server started on port ' + port);
});
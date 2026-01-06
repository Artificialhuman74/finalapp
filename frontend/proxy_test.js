const https = require('https');

// Ignore self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const options = {
    hostname: '127.0.0.1',
    port: 5443,
    path: '/uploads/sos/recordings/20260106_092908_sos_1767691748892.mp4',
    method: 'HEAD'
};

console.log(`Attempting connection to https://${options.hostname}:${options.port}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(`PROBLEM WITH REQUEST: ${e.message}`);
});

req.end();

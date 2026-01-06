const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false
});

module.exports = function (app) {
    // Proxy API calls to backend
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://127.0.0.1:5443',
            changeOrigin: true,
            secure: false, // Accept self-signed certs
            agent: agent,
            cookieDomainRewrite: "localhost",
            logLevel: 'debug'
        })
    );

    // Proxy backend static assets (if needed from backend)
    app.use(
        '/backend-static',
        createProxyMiddleware({
            target: 'https://localhost:5443/static',
            changeOrigin: true,
            secure: false,
            pathRewrite: {
                '^/backend-static': ''
            }
        })
    );

    // Proxy uploads directory
    app.use(
        '/uploads',
        createProxyMiddleware({
            target: 'https://127.0.0.1:5443',
            changeOrigin: false,
            secure: false,
            agent: agent,
            logLevel: 'debug'
        })
    );
};

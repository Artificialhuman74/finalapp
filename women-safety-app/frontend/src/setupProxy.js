const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        ['/api', '/login', '/signup', '/submit_report'],
        createProxyMiddleware({
            target: 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
            cookieDomainRewrite: "",
            logLevel: 'debug',
            onProxyReq: (proxyReq, req, res) => {
                console.log(`[Proxy Request] ${req.method} ${req.url}`);
                if (req.headers.cookie) {
                    console.log(`[Proxy] Browser sent cookies: ${req.headers.cookie}`);
                } else {
                    console.log(`[Proxy] NO cookies sent by browser!`);
                }
            },
            onProxyRes: (proxyRes, req, res) => {
                if (proxyRes.headers['set-cookie']) {
                    console.log('🍪 Original Cookies:', proxyRes.headers['set-cookie']);

                    const cookies = proxyRes.headers['set-cookie'].map(cookie =>
                        cookie
                            .replace(/; secure/gi, '') // Remove Secure flag
                            .replace(/; SameSite=None/gi, '; SameSite=Lax') // Ensure Lax
                    );

                    proxyRes.headers['set-cookie'] = cookies;
                    console.log('🍪 Rewritten Cookies:', cookies);
                }
            }
        })
    );
};

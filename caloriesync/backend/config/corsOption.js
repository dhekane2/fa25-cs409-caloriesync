import allowedOrigins from "./allowedOrigins.js";

// CORS options: allow credentials for cookie-based auth.
// Important: when credentials are enabled, `origin` cannot be '*'.
// Use a specific origin (or echo the incoming origin) and ensure
// your frontend includes `credentials: 'include'` on fetch requests.
export const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like Postman, server-to-server) or if origin is in allowlist
        const frontendOrigin = process.env.FRONTEND_ORIGIN; // optional override from env
        if (!origin) return callback(null, true);
        if (frontendOrigin && origin === frontendOrigin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    // Allow browsers to send cookies (HttpOnly refresh token)
    credentials: true,
    optionsSuccessStatus: 200
};

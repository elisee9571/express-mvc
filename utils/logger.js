const pino = require("pino");
require("dotenv").config();

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    transport: {
        targets: [
            {
                level: "info",
                target: "pino/file",
                options: { destination: "./logs/app.log", mkdir: true },
            },
            {
                level: "error",
                target: "pino/file",
                options: { destination: "./logs/error.log", mkdir: true },
            },
        ],
    },
});

module.exports = logger;

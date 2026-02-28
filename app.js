const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morganLogger = require('morgan');
const cors = require('cors');
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const logger = require('./utils/logger');
const AppError = require("./utils/AppError");

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');

require('dotenv').config();

const app = express();

mongoose.connect(process.env.DATABASE_URL)
  .catch(err => console.error(err));

app.use(morganLogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  "origin": "*",
  "methods": "GET,PUT,PATCH,POST,DELETE",
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id); // pratique pour debug côté client
  next();
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

    logger.info({
      timestamp: new Date().toISOString(),
      request: {
        id: req.id,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
      response: {
        statusCode: res.statusCode,
        contentLength: res.getHeader("content-length"),
        durationMs: Math.round(durationMs * 100) / 100
      }
    });
  });

  next();
});

// Routes
app.use('/auth', authRouter);
app.use('/users', userRouter);

// 404
app.use((req, res, next) => {
  next(new AppError(404, "ROUTE_NOT_FOUND", `Route ${req.method} ${req.path} not found`));
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const now = new Date().toISOString();

  logger.error({
    timestamp: now,
    request: {
      id: req.id,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    },
    user: req.user ? { id: req.userId } : null,
    error: {
      name: err.name,
      code: err.code || "INTERNAL_SERVER_ERROR",
      statusCode,
      message: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
    }
  });

  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "An unexpected error occurred"
      : err.message;

  res.status(statusCode).json({
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: message,
      ...err.meta
    }
  });
});

module.exports = app;

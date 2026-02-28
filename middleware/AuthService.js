const AppError = require("../utils/AppError");

const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError(401, "MISSING_TOKEN", "Missing token"));
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

        if (err) {
            if (err.name === "TokenExpiredError") {
                return next(new AppError(401, "TOKEN_EXPIRED", "Token expired"));
            }

            return next(new AppError(401, "INVALID_TOKEN", "Invalid token"));
        }

        req.userId = decoded.userId;
        next();
    });
};

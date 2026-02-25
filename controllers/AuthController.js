const User = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require('dotenv').config();

const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
};

const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex"); // token aléatoire
};

exports.signUp = async (req, res, next) => {
    try {
        const user = User(req.body);
        await user.validate();

        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken();
        user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30j

        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "strict",
            path: "/auth/refresh",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            accessToken: accessToken
        });

    } catch (err) {

        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        if (err.name === "ValidationError") {
            const errors = Object.values(err.errors).map(e => e.message);

            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken();
        user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30j

        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "strict",
            path: "/auth/refresh",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message: "Login successfully",
            accessToken: accessToken
        });
    } catch (err) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.refresh = async (req, res) => {
    console.log(req.cookies);

    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Missing refresh token"
            });
        }

        const candidates = await User.find({
            refreshTokenHash: { $ne: null }, // not equal
            refreshTokenExpiresAt: { $gt: new Date() }, // greater than
        }).select("_id refreshTokenHash refreshTokenExpiresAt"); // limiter les champs

        if (!candidates.length) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Compare le refresh token reçu avec chaque hash
        let user = null;
        for (const candidat of candidates) {
            const ok = await bcrypt.compare(refreshToken, candidat.refreshTokenHash);
            if (ok) {
                user = candidat;
                break;
            }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        // Rotation
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken();

        user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
        user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: "strict",
            path: "/auth/refresh",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

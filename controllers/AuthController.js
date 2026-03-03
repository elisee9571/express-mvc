const User = require("../models/User");
const AppError = require("../utils/AppError");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

require("dotenv").config();

/**
 * Génère un JWT (JSON Web Token) d'accès pour un utilisateur.
 *
 * Le token contient l'identifiant de l'utilisateur dans le payload
 * et est signé avec la clé secrète définie dans les variables d'environnement.
 * La durée de validité du token est de 15 minutes.
 *
 * @param {int} userId - Identifiant unique de l'utilisateur.
 * @return {string} Token JWT signé valide pendant 15 minutes.
 */
const generateAccessToken = (userId) => jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
);

/**
 * Génère un refresh token sécurisé.
 *
 * Le token est une chaîne aléatoire de 128 caractères hexadécimaux
 * générée à partir de 64 bytes cryptographiquement sécurisés.
 *
 * @return {string} Refresh token sécurisé au format hexadécimal.
 *
 */
const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

exports.signUp = async (req, res) => {
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
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/auth/refresh",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            accessToken: accessToken,
        });

    } catch (err) {

        if (err.code === 11000) { throw new AppError(400, "EMAIL_ALREADY_EXISTS", "Email already exists"); }

        if (err.name === "ValidationError") {
            const validations = Object.values(err.errors).map(e => ({
                message: e.message,
                field: e.path, // correspond au champ Mongoose (email, name, etc.)
            }));

            throw new AppError(400, "VALIDATION_ERROR", "Validation error", { validations });
        }

        throw err;
    }
};

exports.signIn = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) { throw new AppError(401, "INVALID_CREDENTIALS", "Invalid credentials"); }

    const match = await bcrypt.compare(password, user.password);
    if (!match) { throw new AppError(401, "INVALID_CREDENTIALS", "Invalid credentials"); }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30j

    await user.save();

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        success: true,
        message: "Login successfully",
        accessToken: accessToken,
    });
};

exports.refresh = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) { throw new AppError(401, "MISSING_REFRESH_TOKEN", "Missing refresh token"); }

    const candidates = await User.find({
        refreshTokenHash: { $ne: null }, // not equal
        refreshTokenExpiresAt: { $gt: new Date() }, // greater than
    }).select("_id refreshTokenHash refreshTokenExpiresAt"); // limiter les champs

    if (!candidates.length) { throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token"); }

    // Compare le refresh token reçu avec chaque hash
    let user = null;
    for (const candidat of candidates) {
        const ok = await bcrypt.compare(refreshToken, candidat.refreshTokenHash);
        if (ok) {
            user = candidat;
            break;
        }
    }

    if (!user) { throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token"); }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken();

    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    user.refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        success: true,
        message: "Refresh token successfully",
        accessToken: newAccessToken,
    });
};

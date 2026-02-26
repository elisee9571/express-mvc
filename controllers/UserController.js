const User = require('../models/User');
const redisClient = require("../config/redis");

const REDIS_DEFAULT_EXPIRATION = 3600; // 1 heure

exports.users = async (req, res, next) => {
    try {
        const key = "users";
        const data = await redisClient.get(key);

        if (data) return res.status(200).json(JSON.parse(data));

        const users = await User.find();

        await redisClient.set(key, JSON.stringify(users), {
            EX: REDIS_DEFAULT_EXPIRATION
        });

        return res.status(200).json(users);

    } catch (err) {
        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error"
            }
        });
    }
};

exports.user = async (req, res, next) => {
    const { id } = req.params;

    try {
        const key = `user:${id}`;
        const data = await redisClient.get(key);

        if (data) return res.status(200).json(JSON.parse(data));

        const user = await User.findById(id);

        await redisClient.set(key, JSON.stringify(user), {
            EX: REDIS_DEFAULT_EXPIRATION
        });

        return res.status(200).json(user);

    } catch (err) {
        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error"
            }
        });
    }
};

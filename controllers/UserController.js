const User = require('../models/User');
const redisClient = require("../config/redis");

const REDIS_DEFAULT_EXPIRATION = 3600; // 1 heure

exports.users = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;

        const key = `users:${page}:${size}`;

        const data = await redisClient.get(key);
        if (data) return res.status(200).json(JSON.parse(data));

        const offset = (page - 1) * size;

        const [users, count] = await Promise.all([
            User.find()
                .skip(offset)
                .limit(size)
                .lean(), // plus performant si pas besoin des méthodes mongoose pour nos objets
            User.countDocuments()
        ]);

        await redisClient.set(key, JSON.stringify({
            data: users,
            meta: { page, size, count }
        }), {
            EX: REDIS_DEFAULT_EXPIRATION
        });

        return res.status(200).json({
            data: users,
            meta: { page, size, count }
        });

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

        if (!user) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND",
                    message: "User not found"
                }
            });
        }

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

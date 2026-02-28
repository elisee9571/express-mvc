const User = require("../models/User");
const redisClient = require("../config/redis");
const AppError = require("../utils/AppError");

const REDIS_DEFAULT_EXPIRATION = 3600; // 1 heure

exports.users = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const key = `users:${page}:${size}:${sortField}:${sortOrder}`;

    const data = await redisClient.get(key);
    if (data) { return res.status(200).json(JSON.parse(data)); }

    const offset = (page - 1) * size;

    const [users, count] = await Promise.all([
        User.find()
            .select("_id name email")
            .sort({ [sortField]: sortOrder })
            .skip(offset)
            .limit(size)
            .lean() // plus performant si pas besoin des méthodes mongoose pour nos objets
        , User.countDocuments(),
    ]);

    await redisClient.set(key, JSON.stringify({
        data: users,
        meta: { page, size, count },
    }), {
        EX: REDIS_DEFAULT_EXPIRATION,
    });

    return res.status(200).json({
        data: users,
        meta: { page, size, count },
    });
};

exports.user = async (req, res) => {
    const { id } = req.params;

    const key = `user:${id}`;

    const data = await redisClient.get(key);
    if (data) { return res.status(200).json(JSON.parse(data)); }

    const user = await User.findById(id)
        .select("_id name email")
        .lean();
    if (!user) { throw new AppError(404, "RESOURCE_NOT_FOUND", "User not found"); }

    await redisClient.set(key, JSON.stringify(user), {
        EX: REDIS_DEFAULT_EXPIRATION,
    });

    return res.status(200).json(user);
};

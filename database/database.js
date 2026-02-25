const mongoose = require("mongoose");
require("dotenv").config();

async function connect() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
    } catch (error) {
        throw error;
    }
}

module.exports = connect;
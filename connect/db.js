const mongoose = require("mongoose")
const { styleText } = require("node:util")

const connectDb = async function () {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        })
        console.log(
            styleText(["white", "bgBlue"], "DB connection successfully.")
        )
        return conn
    } catch (error) {
        console.log("DB connection error: " + error)
    }
}

module.exports = { connectDb }

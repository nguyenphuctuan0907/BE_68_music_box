const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true }, // Số điện thoại
        birthday: { type: Date },
        role: { type: String, enum: ["admin", "user"], default: "user" },
    },
    { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)

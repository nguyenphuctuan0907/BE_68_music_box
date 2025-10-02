const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        peopleCount: { type: Number, required: true },
        day: { type: String, required: true }, // "DD/MM/YYYY"
        startTime: { type: String, required: true }, // "20h"
        endTime: { type: String, required: false }, // "21h30"
        intent: { type: String, default: "booking" },
        userId: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        birthday: { type: String, default: null }, // ISO format "yyyy-mm-dd" or "____-mm-dd"
        room: { type: String, default: null },
        isNextTime: { type: String, default: null },
        isPrevTime: { type: String, default: null },
        inTime: { type: String, default: null }, // h vào chính xác
        outTime: { type: String, default: null }, // h out chính xác
        isExpired: { type: Boolean, default: false },
    },
    { timestamps: true }
)

module.exports = mongoose.model("Booking", bookingSchema)

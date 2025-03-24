const mongoose = require("mongoose")

const timeSchema = new mongoose.Schema(
    {
        startHour: { type: String, required: true, default: "06:00" },
        endHour: { type: String, required: true, default: "24:00" },
        timeRange: { type: String, require: true, default: "30" },
    }
    // { timestamps: true }
)

module.exports = mongoose.model("Time", timeSchema)

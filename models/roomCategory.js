const mongoose = require("mongoose")

const roomCategorySchema = new mongoose.Schema(
    {
        roomName: { type: String, required: true },
        roomDes: { type: String, required: false }, // description (vd: Phòng dành cho 1-2 người)
        zooms: {
            type: Array,
            required: false,
            default: [],
            ref: "room",
        },
        deleted: { type: Number, require: false, default: 0 },
    },
    { timestamps: true }
)

module.exports = mongoose.model("roomCategory", roomCategorySchema)

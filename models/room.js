const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema(
    {
        roomName: { type: String, required: true },
        roomDes: { type: String, required: false }, // description (vd: Phòng dành cho couple)
        zoomCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            require: false,
            default: null,
            ref: "RoomCategory",
        },
        roomTime: { type: String, required: false, default: "06:00" },
        roomTimeTo: { type: String, required: true, default: "24:00" },
        timeRange: { type: String, require: true, default: "30" },
        zoomStatus: { type: Number, require: false, enum: [0, 1], default: 0 }, // 0: Hoạt động bt, 1: Ko hoạt động(đg sửa chữa...)
        orderStatus: {
            type: Number,
            require: false,
            enum: [0, 1, 2, 3],
            default: 0,
        }, // 0: Sẵn sàng, 1: Chờ chốt phòng, 2: Đã thanh toán, 3: Đã đặt cọc xác nhận giữ chỗ
        userName: { type: String, required: false },
        userPhone: { type: String, required: false },
        bookDate: { type: Date, require: false },
        bookTime: { type: Date, require: false },
        bookTimeTo: { type: Date, require: false },
        priceSchedule: { type: Array },
        deleted: { type: Number, require: false, enum: [0, 1], default: 0 }, // 1: đã xoá
    },
    { timestamps: true }
)

module.exports = mongoose.model("Room", roomSchema)

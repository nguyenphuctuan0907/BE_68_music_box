const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema(
    {
        roomName: { type: String, required: true },
        roomDes: { type: String }, // description (vd: Phòng dành cho couple)
        zoomCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: "RoomCategory",
        },
        roomTime: { type: String, default: "06:00" },
        roomTimeTo: { type: String, require: true, default: "24:00" },
        timeRange: { type: String, require: true, default: "30" },
        zoomStatus: { type: Number, enum: [0, 1], default: 0 }, // 0: Hoạt động bt, 1: Ko hoạt động(đg sửa chữa...)
        orderStatus: {
            type: Number,
            enum: [0, 1, 2, 3],
            default: 0,
        }, // 0: Sẵn sàng, 1: Chờ chốt phòng, 2: Đã thanh toán, 3: Đã đặt cọc xác nhận giữ chỗ
        userName: { type: String },
        userPhone: { type: String },
        bookDate: { type: Date, require: false },
        bookTime: { type: Array, require: false },
        // [{ bookDate: '2025-03-25', name: 'Tuna', payMethod: "bank", phone: '0398498087', roomIds: [], slot: [timeTo: '05:00', price: '40000', range: '30', seatId: '123']}]
        bookTimeTo: { type: Date, require: false },
        priceSchedule: { type: Array },
        deleted: { type: Number, enum: [0, 1], default: 0 }, // 1: đã xoá
    },
    { timestamps: true }
)

module.exports = mongoose.model("Room", roomSchema)

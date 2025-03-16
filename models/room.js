const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema(
    {
        roomName: { type: String, required: true },
        roomDes: { type: String, required: false, default: "" }, // description (vd: Phòng dành cho couple)
        zoomCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            require: false,
            default: null,
            ref: "roomCategory",
        },
        deleted: { type: Number, require: false, default: 0 },

        bookDate: { type: Date, require: false, default: null },
        bookTime: { type: Date, require: false, default: null },
        bookTimeTo: { type: Date, require: false, default: null },
        // order_id:
        zoomStatus: { type: Number, require: false, enum: [0, 1], default: 0 }, // 0: Hoạt động bt, 1: Ko hoạt động(đg sửa chữa...)
        orderStatus: {
            type: Number,
            require: false,
            enum: [0, 1, 2, 3],
            default: 0,
        }, // 0: Sẵn sàng, 1: Chờ chốt phòng, 2: Đã thanh toán, 3: Đã đặt cọc xác nhận giữ chỗ
        userName: { type: String, required: false, default: "" },
        userPhone: { type: String, required: false, default: "" },
    },
    { timestamps: true }
)

module.exports = mongoose.model("room", roomSchema)

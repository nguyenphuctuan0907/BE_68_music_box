const Time = require("../models/time")
const Room = require("../models/room")

// get all
exports.getTime = async (req, res) => {
    try {
        const time = await Time.findOne().exec()
        res.status(200).json({ code: 200, data: time })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// update
exports.updateTime = async (req, res) => {
    const { startHour, endHour, timeRange } = req.body
    if (!startHour || !endHour || !timeRange)
        return res
            .status(400)
            .json({ code: 400, error: "Dữ liệu không hợp lệ" })
    try {
        const newTime = await Time.findOneAndUpdate(
            { _id: null },
            { startHour, endHour, timeRange },
            { upsert: true, new: true, setDefaultsOnInsert: true }
            // upsert: true: Nếu không tìm thấy bản ghi phù hợp, một bản ghi mới sẽ được tạo.
            // new: true: Trả về bản ghi đã được cập nhật thay vì bản ghi gốc.
            // setDefaultsOnInsert: true: Áp dụng các giá trị mặc định từ schema nếu tạo bản ghi mới.
        ).exec()

        await Room.updateMany(
            {},
            { $set: { roomTime: startHour, roomTimeTo: endHour, timeRange } }
        ).exec()

        res.status(200).json({ code: 200, data: newTime })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

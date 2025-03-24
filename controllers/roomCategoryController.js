const RoomCategory = require("../models/roomCategory")

exports.createRoomCategory = async (req, res) => {
    try {
        const { roomName, roomDes, zooms } = req.body

        // Valid
        if (!roomName)
            return res
                .status(400)
                .json({ code: 400, error: "Dữ liệu không hợp lệ" })

        const newRoom = new RoomCategory({ roomName, roomDes }).exec()
        await newRoom.save().exec()
        res.status(200).json({ code: 200, data: { roomName, roomDes, zooms } })
    } catch (error) {
        return res.status(500).json({ code: 500, error })
    }
}

// get all
exports.getRoomCategory = async (req, res) => {
    try {
        const listRoom = await RoomCategory.find({ deleted: 0 })
            .populate("zooms")
            .exec()
        res.status(200).json({ code: 200, data: listRoom })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// update
exports.updateRoomCategory = async (req, res) => {
    try {
        const { roomName, roomDes } = req.body
        if (!roomName && !roomDes)
            return res
                .status(400)
                .json({ code: 400, error: "Dữ liệu không hợp lệ" })
        const room = await RoomCategory.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { roomName, roomDes } }
        ).exec()
        res.status(200).json({ code: 200, data: room })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// delete draft
exports.deleteDraftRoomCategory = async (req, res) => {
    try {
        const newRoome = await RoomCategory.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { deleted: 1 } },
            { new: true }
        ).exec()
        res.status(200).json({
            code: 200,
            message: "Xoá thành công",
            data: { newRoome },
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// delete luôn
exports.deleteRoomCategory = async (req, res) => {
    try {
        await RoomCategory.deleteOne({ _id: req.params.id }).exec()
        res.status(200).json({ code: 200, message: "Xoá thành công" })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

const Room = require("../models/room")

exports.createRoom = async (req, res) => {
    const { roomName, roomDes, zoomCategoryId } = req.body

    // Valid
    if (!roomName)
        return res
            .status(400)
            .json({ code: 400, error: "Dữ liệu không hợp lệ" })

    try {
        const newRoom = new Room({ roomName, roomDes, zoomCategoryId })
        await newRoom.save()
        res.status(200).json({
            code: 200,
            data: { roomName, roomDes, zoomCategoryId },
        })
    } catch (error) {
        return res.status(500).json({ code: 500, error })
    }
}

// get all
exports.getRoom = async (req, res) => {
    try {
        const listRoom = await Room.find({ deleted: 0 }).populate(
            "zoomCategoryId"
        )
        res.status(200).json({ code: 200, data: listRoom })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// update
exports.updateRoom = async (req, res) => {
    const { roomName, roomDes, zoomCategoryId } = req.body
    console.log({ zoomCategoryId })
    if (!roomName && !roomDes)
        return res
            .status(400)
            .json({ code: 400, error: "Dữ liệu không hợp lệ" })
    try {
        const room = await Room.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { roomName, roomDes, zoomCategoryId } }
        )
        res.status(200).json({ code: 200, data: room })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// delete draft
exports.deleteDraftRoom = async (req, res) => {
    try {
        const newRoome = await Room.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { deleted: 1 } },
            { new: true }
        )
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
exports.deleteRoom = async (req, res) => {
    try {
        await Room.deleteOne({ _id: req.params.id })
        res.status(200).json({ code: 200, message: "Xoá thành công" })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

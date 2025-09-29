const Room = require("../models/room")
const RoomCategory = require("../models/roomCategory")

exports.createRoom = async (req, res) => {
    try {
        const { roomName, roomDes, zoomCategoryId } = req.body

        // Valid
        if (!roomName)
            return res
                .status(400)
                .json({ code: 400, error: "Dữ liệu không hợp lệ" })

        const newRoom = new Room({ roomName, roomDes, zoomCategoryId }).exec()
        const room = await newRoom.save()

        await RoomCategory.findByIdAndUpdate(
            zoomCategoryId,
            { $addToSet: { zooms: room._id } }, // $addToSet sẽ tránh trùng lặp deepCompare
            { new: true }
        )

        res.status(200).json({
            code: 200,
            data: room,
        })
    } catch (error) {
        return res.status(500).json({ code: 500, error })
    }
}

// get all
exports.getRoom = async (req, res) => {
    try {
        const listRoom = await Room.find({ deleted: 0 })
            .populate("zoomCategoryId")
            .exec()
        res.status(200).json({ code: 200, data: listRoom })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// update
exports.updateRoom = async (req, res) => {
    try {
        const { roomName, roomDes, zoomCategoryId } = req.body
        if (!roomName && !roomDes)
            return res
                .status(400)
                .json({ code: 400, error: "Dữ liệu không hợp lệ" })
        const room = await Room.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { roomName, roomDes, zoomCategoryId } }
        ).exec()

        await RoomCategory.findByIdAndUpdate(
            zoomCategoryId,
            { $addToSet: { zooms: req.params.id } },
            { new: true }
        ).exec()

        res.status(200).json({ code: 200, data: room })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// delete draft
exports.deleteDraftRoom = async (req, res) => {
    try {
        const room = await Room.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { deleted: 1 } },
            { new: true }
        ).exec()

        await RoomCategory.findByIdAndUpdate(
            room.zoomCategoryId,
            { $pull: { zooms: room._id } }, // $pull sẽ gỡ ObjectId ra khỏi mảng
            { new: true }
        ).exec()

        res.status(200).json({
            code: 200,
            message: "Xoá thành công",
            data: room,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// delete luôn
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.deleteOne({ _id: req.params.id })
        await RoomCategory.findByIdAndUpdate(
            room.zoomCategoryId,
            { $pull: { zooms: room._id } },
            { new: true }
        ).exec()
        res.status(200).json({ code: 200, message: "Xoá thành công" })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// update prices
exports.updatePriceScheduleRoom = async (req, res) => {
    try {
        const { listPriceHour } = req.body
        const room = await Room.findOneAndUpdate(
            { _id: req.params.id },
            { priceSchedule: listPriceHour },
            { new: true }
        ).exec()
        res.status(200).json({ code: 200, data: room })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

const filterPriceId = (ID, data = []) =>
    data.filter((item) => item.seatId == ID)

// update book time
exports.updateBookTimeRoom = async (req, res) => {
    try {
        const booking = req.body
        const rooms = await Room.find({
            _id: { $in: booking.roomIds },
        })

        for (let room of rooms) {
            let updatedBookTime = []
            if (room.bookTime.length < 1) {
                updatedBookTime = {
                    ...booking,
                    slot: filterPriceId(room._id, booking.slot),
                }
            } else {
                
                

                // updatedBookTime = booking.slot.map((bt) => {
                //     console.log({ bt })
                //     if (bt.phone === booking.phone) {
                //         let updatedSlots = bt.slot.filter(
                //             (s) =>
                //                 !booking.slot.some(
                //                     (newSlot) =>
                //                         newSlot.timeTo === s.timeTo &&
                //                         newSlot.deleted
                //                 )
                //         )

                //         let newSlots = booking.slot.filter(
                //             (newSlot) =>
                //                 !updatedSlots.some(
                //                     (s) => s.timeTo === newSlot.timeTo
                //                 )
                //         )

                //         return { ...bt, slot: [...updatedSlots, ...newSlots] }
                //     }
                //     return bt
                // })
            }

            console.log({ updatedBookTime })

            await Room.updateOne(
                { _id: room._id },
                { $set: { bookTime: updatedBookTime } }
            )
        }
        res.status(200).json({ code: 200, data: rooms })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

const moment = require("moment-timezone")

const { getIo } = require("../connect/socket")
const Booking = require("../models/booking")
const User = require("../models/user")
// const { createUser } = require("./userController") Nên tách hàm tạo user riêng ra để dùng chung

exports.createBooking = async (req, res) => {
    // tạo user và booking nếu chưa có
    try {
        const data = req.body

        // Valid
        for (let i = 0; i < data.length; i++) {
            const { phone, peopleCount, startTime, name } = data[i]
            if (!phone || !peopleCount || !startTime || !name)
                return res.status(400).json({
                    code: 400,
                    error: "Thông tin tên, số điện thoại, số người, giờ hát là bắt buộc. Vui lòng cung cấp đầy đủ thông tin!",
                })
        }

        const findUser = await User.findOne({
            // kiếm user theo phone nếu chưa có thì tạo mới
            phone: { $in: data[0].phone },
        })
        let user = null
        if (!findUser) {
            const newUser = new User({
                name: data[0].name,
                phone: data[0].phone,
                birthday: data[0].birthday,
            })
            user = await newUser.save()
        }

        console.log({ data })
        // Create booking
        const id = findUser?._id || user?._id
        for (let i = 0; i < data.length; i++) {
            data[i].userId = id
            data[i].isExpired = checkMinuteCurrent(data[i])
        }
        const newBooking = await Booking.insertMany(data)

        res.status(200).json({
            code: 200,
            data: newBooking,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error })
    }
}

exports.updateBooking = async (req, res) => {
    try {
        const { name, phone, birthday, outTime, day } = req.body
        // Valid
        if (!name || !phone)
            return res.status(400).json({
                code: 400,
                error: "Thông tin tên và số điện thoại là bắt buộc. Vui lòng cung cấp đầy đủ thông tin!",
            })

        const newUser = User.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    name,
                    phone,
                    birthday,
                    isExpired: checkMinuteCurrent({ outTime, day }),
                },
            },
            { new: true }
        )
        res.status(200).json({
            code: 200,
            data: newUser,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error })
    }
}
exports.updateInfoBooking = async (req, res) => {
    try {
        const { ids, data } = req.body
        const { name, phone, day, outTime } = data
        // Valid
        if (!name || !phone)
            return res.status(400).json({
                code: 400,
                error: "Thông tin tên và số điện thoại là bắt buộc. Vui lòng cung cấp đầy đủ thông tin!",
            })

        data.isExpired = checkMinuteCurrent({ day, outTime })
        await Booking.updateMany(
            { _id: { $in: ids } }, // lọc theo danh sách id
            { $set: data } // update chung 1 giá trị
        )

        // Lấy lại danh sách user vừa update
        const listBookingUpdate = await Booking.find({ _id: { $in: ids } })

        await User.updateOne(
            { _id: listBookingUpdate[0].userId },
            { $set: data }
        )

        res.status(200).json({
            code: 200,
            data: listBookingUpdate,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error })
    }
}

const handleGetBooking = async (day) => {
    return await Booking.aggregate([
        {
            $match: {
                day: { $in: day.split(",") },
            },
        },
        {
            $addFields: {
                // Chuyển đổi day thành Date object để sort
                parsedDay: {
                    $dateFromString: {
                        dateString: {
                            $concat: [
                                {
                                    $arrayElemAt: [
                                        { $split: ["$day", "/"] },
                                        2,
                                    ],
                                }, // year
                                "-",
                                {
                                    $arrayElemAt: [
                                        { $split: ["$day", "/"] },
                                        1,
                                    ],
                                }, // month
                                "-",
                                {
                                    $arrayElemAt: [
                                        { $split: ["$day", "/"] },
                                        0,
                                    ],
                                }, // day
                            ],
                        },
                    },
                },
                // Chuyển đổi startTime thành phút để sort
                startTimeInMinutes: {
                    $add: [
                        {
                            $multiply: [
                                {
                                    $toInt: {
                                        $arrayElemAt: [
                                            {
                                                $split: ["$startTime", ":"],
                                            },
                                            0,
                                        ],
                                    },
                                },
                                60,
                            ],
                        },
                        {
                            $toInt: {
                                $arrayElemAt: [
                                    { $split: ["$startTime", ":"] },
                                    1,
                                ],
                            },
                        },
                    ],
                },
            },
        },
        {
            $sort: {
                parsedDay: 1,
                startTimeInMinutes: 1,
            },
        },
        {
            $project: {
                parsedDay: 0,
                startTimeInMinutes: 0,
            },
        },
    ])
}

// get
exports.getBooking = async (req, res) => {
    const { day } = req.query

    try {
        const listBooking = await handleGetBooking(day)

        res.status(200).json({ code: 200, data: listBooking })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

// delete luôn
exports.deleteBooking = async (req, res) => {
    const { ids } = req.body // mảng id gửi lên từ client
    try {
        const findBooking = await Booking.find({ _id: { $in: ids } })
        await Booking.deleteMany({ _id: { $in: ids } })
        res.status(200).json({
            code: 200,
            message: "Yêu cầu thực hiện thành công",
            data: findBooking, // trả về danh sách booking đã xoá
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

function isDateTimeInRange(day, checkTime, startTime, endTime) {
    const parse = (time) =>
        new Date(`${day.split("/").reverse().join("-")}T${time}:00`)

    const check = parse(checkTime)
    const start = parse(startTime)
    const end = parse(endTime)

    return check >= start && check <= end
}

function addMinutes(time, minutesToAdd) {
    let [h, m] = time.split(":").map(Number)
    let total = h * 60 + m + minutesToAdd

    // Nếu vượt quá 24:00 thì ép về 24:00
    if (total >= 24 * 60) {
        return "24:00"
    }

    // Nếu sau cộng mà > 23:30 thì vẫn ép về 24:00 (theo yêu cầu đặc biệt)
    if (total > 23 * 60 + 30) {
        return "24:00"
    }

    const newH = Math.floor(total / 60)
    const newM = total % 60

    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
}

function addOneDay(day) {
    // Tách chuỗi "dd/MM/yyyy"
    const [d, m, y] = day.split("/").map(Number)

    // Khởi tạo Date theo định dạng JS (y, mIndex, d)
    const date = new Date(y, m - 1, d)

    // Cộng thêm 1 ngày
    date.setDate(date.getDate() + 1)

    // Format lại "dd/MM/yyyy"
    const newD = String(date.getDate()).padStart(2, "0")
    const newM = String(date.getMonth() + 1).padStart(2, "0")
    const newY = date.getFullYear()

    return `${newD}/${newM}/${newY}`
}

function subOneDay(day) {
    // Tách chuỗi "dd/MM/yyyy"
    const [d, m, y] = day.split("/").map(Number)

    // Khởi tạo Date theo định dạng JS (y, mIndex, d)
    const date = new Date(y, m - 1, d)

    // Trừ đi 1 ngày
    date.setDate(date.getDate() - 1)

    // Format lại "dd/MM/yyyy"
    const newD = String(date.getDate()).padStart(2, "0")
    const newM = String(date.getMonth() + 1).padStart(2, "0")
    const newY = date.getFullYear()

    return `${newD}/${newM}/${newY}`
}

const checkIsValidTime = (list = [], day, timeCheck) => {
    for (let i = 0; i < list.length; i++) {
        if (
            isDateTimeInRange(
                day,
                timeCheck,
                list[i].startTime,
                list[i].endTime
            )
        )
            return true
    }

    return false
}

exports.addBookingTime = async (req, res) => {
    const { id, timeRange } = req.body // mảng id gửi lên từ client
    try {
        const findBooking = await Booking.findOne({ _id: id })
        let { day, endTime, room } = findBooking
        let result = {}

        if (endTime === "24:00") {
            const addTime = addMinutes("00:00", timeRange)
            const addDay = addOneDay(day)
            const listBooking = await Booking.find({ room, day: addDay })
            if (checkIsValidTime(listBooking, addDay, addTime))
                return res.status(400).json({
                    code: 400,
                    error: `Yêu cầu thực hiện không thành công. ${addTime} đã có khách đặt`,
                })

            result = await Booking.create({
                name: findBooking.name,
                phone: findBooking.phone,
                peopleCount: findBooking.peopleCount,
                day: addDay,
                startTime: "00:00",
                endTime: addTime,
                intent: findBooking.intent,
                userId: findBooking.userId,
                birthday: findBooking.birthday,
                room: findBooking.room,
                isPrevTime: `${findBooking.startTime}_${endTime}_${day}`,
                isNextTime: null,
                inTime: findBooking.inTime,
                outTime: addTime,
                isExpired: checkMinuteCurrent({
                    outTime: addTime,
                    day: addDay,
                }),
            })

            await Booking.updateOne(
                { _id: id },
                { $set: { isNextTime: `00:00_${addTime}_${addDay}` } }
            )
        } else {
            let addTime = addMinutes(endTime, Number(timeRange))
            let timeCheck = addTime

            if (addTime === "24:00") {
                day = addOneDay(day)
                timeCheck = "00:00"
            }

            const listBooking = await Booking.find({ room, day })

            if (checkIsValidTime(listBooking, day, timeCheck))
                return res.status(400).json({
                    code: 400,
                    error: `Yêu cầu thực hiện không thành công. ${timeCheck} đã có khách đặt`,
                })

            result = await Booking.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        endTime: addTime,
                        isExpired: checkMinuteCurrent({
                            outTime: timeCheck,
                            day,
                        }),
                        outTime: addTime,
                    },
                    new: true,
                }, // trả về doc mới sau khi update >= 6
                { returnDocument: "after" } // trả về doc mới sau khi update với mongoose < 6
            )
            console.log({ result })
        }

        return res.status(200).json({
            code: 200,
            message: "Yêu cầu thực hiện thành công.",
            data: result,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

function subMinutes(time, minutesToSub) {
    let [h, m] = time.split(":").map(Number)
    let total = h * 60 + m - minutesToSub

    // Nếu nhỏ hơn 00:00 thì ép về 00:00
    if (total <= 0) {
        return "00:00"
    }

    const newH = Math.floor(total / 60)
    const newM = total % 60

    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
}

exports.reduceBookingTime = async (req, res) => {
    const { id, timeRange } = req.body

    try {
        let result = {}
        const doc = await Booking.findOne({ _id: id })
        if (doc) {
            const reduceTime = subMinutes(doc.endTime, timeRange)
            if (reduceTime === doc.startTime) {
                if (doc.isPrevTime) {
                    const [startTime, endTime, day] = doc.isPrevTime.split("_")
                    await Booking.updateOne(
                        { day, startTime, endTime, room: doc.room },
                        { $set: { isNextTime: null, outTime: endTime } }
                    )
                }
                result.data = await Booking.findOneAndDelete({ _id: id })
                result.isDelete = true
            } else {
                if (doc.isPrevTime) {
                    const [startTime, endTime, day] = doc.isPrevTime.split("_")
                    await Booking.updateOne(
                        { day, startTime, endTime, room: doc.room },
                        {
                            $set: {
                                isNextTime: `${doc.startTime}_${reduceTime}_${doc.day}`,
                            },
                        }
                    )
                }
                doc.endTime = reduceTime // logic update
                doc.outTime = reduceTime
                doc.isExpired = checkMinuteCurrent({
                    outTime: reduceTime,
                    day: doc.day,
                })
                result.data = await doc.save()
                result.isDelete = false
            }
        }
        return res.status(200).json({
            code: 200,
            message: "Yêu cầu thực hiện thành công.",
            data: result,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

exports.lateBookingTime = async (req, res) => {
    const { id, timeRange } = req.body

    try {
        let result = null
        const doc = await Booking.findOne({ _id: id })
        let addTime = ""
        if (doc.isPrevTime) {
            const [startTime, endTime, day] = doc.isPrevTime.split("_")
            addTime = addMinutes(startTime, timeRange)

            if (addTime === endTime) {
                // 24:00
                doc.isPrevTime = null
                doc.inTime = doc.startTime
                result = await doc.save()
                await Booking.findOneAndDelete({
                    startTime,
                    endTime,
                    day,
                    room: doc.room,
                })
            } else {
                await Booking.findOneAndUpdate(
                    { startTime, endTime, day, room: doc.room },
                    { $set: { startTime: addTime, inTime: addTime } }
                )
                doc.isPrevTime = `${addTime}_${endTime}_${day}`
                result = await doc.save()
            }
        } else {
            addTime = addMinutes(doc.startTime, timeRange)
            if (addTime === doc.endTime) {
                result = await Booking.deleteOne({ _id: id })
            } else {
                doc.startTime = addTime // logic update
                doc.inTime = addTime
                result = await doc.save()
            }
        }
        return res.status(200).json({
            code: 200,
            message: "Yêu cầu thực hiện thành công.",
            data: result,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

exports.earlyBookingTime = async (req, res) => {
    const { id, timeRange } = req.body

    try {
        let result = null
        const doc = await Booking.findOne({ _id: id })

        if (doc.isPrevTime) {
            const [startTime, endTime, day] = doc.isPrevTime.split("_")
            const prevTime = subMinutes(startTime, timeRange)
            const listBooking = await Booking.find({ room: doc.room, day })

            if (checkIsValidTime(listBooking, day, prevTime))
                return res.status(400).json({
                    code: 400,
                    error: `Yêu cầu thực hiện không thành công. ${prevTime} đã có khách đặt`,
                })
            await Booking.findOneAndUpdate(
                {
                    day,
                    startTime,
                    endTime,
                    room: doc.room,
                },
                { $set: { startTime: prevTime, inTime: prevTime } }
            )

            doc.isPrevTime = `${prevTime}_${endTime}_${day}`
            result = await doc.save()
        } else {
            const prevDay = subOneDay(doc.day)
            const subTime = subMinutes(doc.startTime, timeRange)
            const listBooking = await Booking.find({
                room: doc.room,
                day: doc.day,
            })

            if (doc.startTime === "00:00") {
                if (checkIsValidTime(listBooking, prevDay, "23:30"))
                    return res.status(400).json({
                        code: 400,
                        error: `Yêu cầu thực hiện không thành công. 23:30 đã có khách đặt`,
                    })

                doc.isPrevTime = `23:30_24:00_${prevDay}`
                result = await doc.save()
                await Booking.create({
                    name: doc.name,
                    phone: doc.phone,
                    peopleCount: doc.peopleCount,
                    birthday: doc.birthday,
                    day: prevDay,
                    startTime: "23:30",
                    endTime: "24:00",
                    inTime: "23:30",
                    outTime: "24:00",
                    intent: doc.intent,
                    userId: doc.userId,
                    room: doc.room,
                    isPrevTime: null,
                    isNextTime: `${doc.startTime}_${doc.endTime}_${doc.day}`,
                })
            } else {
                if (checkIsValidTime(listBooking, doc.day, subTime))
                    return res.status(400).json({
                        code: 400,
                        error: `Yêu cầu thực hiện không thành công. ${subTime} đã có khách đặt`,
                    })
                result = await Booking.findOneAndUpdate(
                    { _id: id },
                    { $set: { startTime: subTime, inTime: subTime } }
                )
            }
        }
        return res.status(200).json({
            code: 200,
            message: "Yêu cầu thực hiện thành công.",
            data: result,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

function generateTimeSlots(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)

    // Xử lý trường hợp 24:00 = 0:00 ngày hôm sau
    const endTotalMinutes =
        endHour === 24 && endMinute === 0 ? 24 * 60 : endHour * 60 + endMinute

    let currentMinutes = startHour * 60 + startMinute
    const slots = []

    while (currentMinutes <= endTotalMinutes) {
        const h = Math.floor(currentMinutes / 60)
        const m = currentMinutes % 60
        const hh = String(h).padStart(2, "0")
        const mm = String(m).padStart(2, "0")

        // Nếu đúng 1440 phút thì format thành "24:00"
        if (currentMinutes === 1440) {
            slots.push("24:00")
        } else {
            slots.push(`${hh}:${mm}`)
        }

        currentMinutes += 30
    }

    return slots
}

exports.changeBookingRoom = async (req, res) => {
    const { ids, roomChange } = req.body

    try {
        const listBooking = await Booking.find({ _id: { $in: ids } })

        for (let i = 0; i < listBooking.length; i++) {
            const booking = listBooking[i]
            const timeSlot = generateTimeSlots(
                listBooking[i].startTime,
                booking.endTime
            )
            const listBookingDay = await Booking.find({
                room: roomChange,
                day: listBooking[i].day,
            })
            console.log({ timeSlot, listBookingDay })
            for (let j = 0; j < timeSlot.length; j++) {
                if (
                    checkIsValidTime(listBookingDay, booking.day, timeSlot[j])
                ) {
                    return res.status(400).json({
                        code: 400,
                        error: `Chuyển phòng không thành công. Phòng ${roomChange} đã có khách đặt cùng khung giờ`,
                    })
                }
                if (timeSlot[j] === "00:00") {
                    const subDay = subOneDay(booking.day)
                    const listBookingPrevDay = await Booking.find({
                        room: roomChange,
                        day: subDay,
                    })

                    if (checkIsValidTime(listBookingPrevDay, subDay, "24:00")) {
                        return res.status(400).json({
                            code: 400,
                            error: `Chuyển phòng không thành công. Phòng ${roomChange} đã có khách đặt cùng khung giờ`,
                        })
                    }
                }
            }
        }

        const result = await Booking.updateMany(
            { _id: { $in: ids } }, // lọc theo danh sách id
            { $set: { room: roomChange } } // update chung 1 giá trị
        )

        return res.status(200).json({
            code: 200,
            message: "Yêu cầu thực hiện thành công.",
            data: result,
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number)
    return h * 60 + m
}

function checkMinuteCurrent(data) {
    const { day, outTime } = data
    const [d, m, y] = day.split("/").map(Number)
    const [hour, minute] = outTime.split(":").map(Number)

    // Tạo datetime của outTime theo VN
    const outDateTime = moment.tz(
        `${y}-${m.toString().padStart(2, "0")}-${d
            .toString()
            .padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`,
        "YYYY-MM-DD HH:mm",
        "Asia/Ho_Chi_Minh"
    )

    // Lấy thời gian hiện tại VN
    const nowVN = moment.tz("Asia/Ho_Chi_Minh")

    return outDateTime.isSameOrBefore(nowVN)
}

exports.checkBookingsTime = async (req, res) => {
    try {
        const now = new Date()

        const d = now.getDate().toString().padStart(2, "0")
        const m = (now.getMonth() + 1).toString().padStart(2, "0")
        const y = now.getFullYear()
        const currentDay = `${d}/${m}/${y}`

        // nextDay
        const tomorrow = new Date(now) // clone
        tomorrow.setDate(now.getDate() + 1)
        const d2 = tomorrow.getDate().toString().padStart(2, "0")
        const m2 = (tomorrow.getMonth() + 1).toString().padStart(2, "0")
        const y2 = tomorrow.getFullYear()
        const nextDay = `${d2}/${m2}/${y2}`

        // Lọc booking của hôm nay và đã hết giờ
        const bookingsToday = await Booking.find({
            day: currentDay,
            // outTime: { $lte: currentTime }, phải kiểu date mới so sánh được
            isExpired: false,
        })

        // Lọc bằng JS
        const expiredBookings = bookingsToday.filter(checkMinuteCurrent)

        if (expiredBookings.length) {
            for (const booking of expiredBookings) {
                booking.isExpired = true
                await booking.save()
            }

            const bookings = await handleGetBooking(
                [currentDay, nextDay].join(",")
            )

            const io = getIo()

            io.emit("bookingExpired", {
                bookingsExp: expiredBookings,
                bookings: bookings,
            })
        }

        if (res) {
            return res.status(200).json({
                code: 200,
                message: "Kiểm tra và cập nhật booking hết giờ thành công.",
                data: expiredBookings,
            })
        }
        console.log("📢 Emit bookingExpired:", expiredBookings.length)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ code: 500, error: error.message })
    }
}

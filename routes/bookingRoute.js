const express = require("express")

const {
    createBooking,
    getBooking,
    updateInfoBooking,
    deleteBooking,
    addBookingTime,
    reduceBookingTime,
    lateBookingTime,
    earlyBookingTime,
    changeBookingRoom,
} = require("../controllers/bookingController")

const router = express.Router()

router.post("/create", createBooking)
router.get("/getBookingByDay", getBooking)
router.put("/updateInfo", updateInfoBooking)
router.delete("/delete", deleteBooking)
router.patch("/addTime", addBookingTime)
router.patch("/reduceTime", reduceBookingTime)
router.patch("/lateBooking", lateBookingTime)
router.patch("/earlyBooking", earlyBookingTime)
router.patch("/changeRoom", changeBookingRoom)

module.exports = router

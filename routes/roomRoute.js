const express = require("express")

const {
    createRoom,
    getRoom,
    deleteRoom,
    deleteDraftRoom,
    updateRoom,
    updatePriceScheduleRoom,
    updateBookTimeRoom,
} = require("../controllers/roomController")

const router = express.Router()

router.post("/create", createRoom)
router.get("/getAll", getRoom)
router.patch("/update/:id", updateRoom)
router.delete("/delete/:id", deleteRoom)
router.patch("/deleteDraft/:id", deleteDraftRoom)
router.patch("/updatePrice/:id", updatePriceScheduleRoom)
router.patch("/updateBookTime", updateBookTimeRoom)

module.exports = router

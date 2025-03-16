const express = require("express")

const {
    createRoom,
    getRoom,
    deleteRoom,
    deleteDraftRoom,
    updateRoom,
} = require("../controllers/roomController")

const router = express.Router()

router.post("/create", createRoom)
router.get("/getAll", getRoom)
router.patch("/update/:id", updateRoom)
router.delete("/delete/:id", deleteRoom)
router.patch("/deleteDraft/:id", deleteDraftRoom)

module.exports = router

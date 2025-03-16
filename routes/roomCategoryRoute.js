const express = require("express")

const {
    createRoomCategory,
    getRoomCategory,
    deleteRoomCategory,
    deleteDraftRoomCategory,
    updateRoomCategory,
} = require("../controllers/roomCategoryController")

const router = express.Router()

router.post("/create", createRoomCategory)
router.get("/getAll", getRoomCategory)
router.patch("/update/:id", updateRoomCategory)
router.delete("/delete/:id", deleteRoomCategory)
router.patch("/deleteDraft/:id", deleteDraftRoomCategory)

module.exports = router

const express = require("express")

const {
    createUser,
    getRoom,
    deleteRoom,
    deleteDraftRoom,
    updateUser,
    updatePriceScheduleRoom,
    updateBookTimeRoom,
} = require("../controllers/userController")

const router = express.Router()

router.post("/create", createUser)
// router.get("/getAll", getRoom)
router.patch("/update/:id", updateUser)
// router.delete("/delete/:id", deleteRoom)
// router.patch("/deleteDraft/:id", deleteDraftRoom)
// router.patch("/updatePrice/:id", updatePriceScheduleRoom)
// router.patch("/updateBookTime", updateBookTimeRoom)

module.exports = router

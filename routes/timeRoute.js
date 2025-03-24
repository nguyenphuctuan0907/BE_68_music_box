const express = require("express")

const { getTime, updateTime } = require("../controllers/timeController")

const router = express.Router()

router.get("/getTime", getTime)
router.put("/updateTime", updateTime)

module.exports = router

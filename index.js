require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

// import fun
const { connectDb } = require("./connect/db")

const roomCategoryRoute = require("./routes/roomCategoryRoute")
const roomRoute = require("./routes/roomRoute")
const timeRoute = require("./routes/timeRoute")

const app = express()
app.use(cors({ methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }))
app.use(express.json())

// Kết nối MongoDB
connectDb()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Routes
app.use("/api/v1/roomCategory", roomCategoryRoute)
app.use("/api/v1/room", roomRoute)
app.use("/api/v1/time", timeRoute)

const PORT = process.env.PORT || 3001
app.listen(PORT, () =>
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
)

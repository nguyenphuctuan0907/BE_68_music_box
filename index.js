require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const cron = require("node-cron")

const { connectSocketIo } = require("./connect/socket")
// import fun
const { connectDb } = require("./connect/db")

const roomCategoryRoute = require("./routes/roomCategoryRoute")
const roomRoute = require("./routes/roomRoute")
const timeRoute = require("./routes/timeRoute")
const userRoute = require("./routes/userRoute")
const bookingRoute = require("./routes/bookingRoute")
const { checkBookingsTime } = require("./controllers/bookingController")

const app = express()
app.use(cors({ methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }))
app.use(express.json())

// connect MongoDB
connectDb()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Test route
app.get("/", (req, res) => {
    res.send("API backend is running 🚀")
})

// Routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/roomCategory", roomCategoryRoute)
app.use("/api/v1/room", roomRoute)
app.use("/api/v1/time", timeRoute)
app.use("/api/v1/booking", bookingRoute)

const PORT = process.env.PORT || 3001
// app.listen(PORT, () =>
//     console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
// )

// connect socket.io
const io = connectSocketIo(app)

io.httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
})

// Mỗi phút chạy checkBookingsTime
cron.schedule("* * * * *", async () => {
    console.log("⏰ CRON: running checkBookingsTime...")
    try {
        // Tự gọi controller trực tiếp thay vì HTTP request
        await checkBookingsTime()
    } catch (err) {
        console.error("❌ CRON ERROR:", err.message)
    }
})

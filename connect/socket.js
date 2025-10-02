const http = require("http")
const { Server } = require("socket.io")

let io
const connectSocketIo = (app) => {
    // HTTP server
    const server = http.createServer(app)

    // Socket.IO server
    io = new Server(server, {
        cors: {
            origin: "*", // hoặc origin FE của bạn: "https://your-fe.vercel.app"
            methods: ["GET", "POST"],
        },
    })

    io.on("connection", (socket) => {
        console.log("🔥 Có client kết nối:", socket.id)
        // gửi 1 sự kiện test về client ngay khi connect
        socket.emit("welcome", "Xin chào từ server 🎉")

        socket.on("disconnect", () => {
            console.log("❌ Client ngắt:", socket.id)
        })
    })

    console.log("🚀 Socket.IO server is running.")
    return io
}

function getIo() {
    if (!io) {
        throw new Error("Socket.io chưa được khởi tạo!")
    }
    return io
}

module.exports = { connectSocketIo, getIo }

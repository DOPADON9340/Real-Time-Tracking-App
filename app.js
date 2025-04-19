const express = require('express');
const app = express();
const path = require("path");
const http  = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const users = {};  // <--- Store socket.id => location

io.on("connection", function (socket) {
    console.log(`User connected`);

    // Send existing users to the new one
    socket.emit("init-markers", users);

    socket.on("send-location", function (data) {
        users[socket.id] = data; // Save or update location

        // Broadcast this location to everyone else
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function () {
        console.log(`User disconnected`);
        delete users[socket.id];
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", function(req,res){
    res.render("index.ejs");
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const mongoose = require("mongoose");
const cors = require("cors")
const dotenv = require("dotenv")



const {Server} = require("socket.io")
const http = require("http");
const express = require("express")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        origin: ["http://localhost:3000/"],
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket)=>{
    console.log("a user is connected", socket.id)

    socket.on("disconnect", ()=> {
        console.log("a user is disconnected", socket.id)

    })
})


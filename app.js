const express = require("express")
const app = express()
const cors = require("cors")
const mongoose = require("mongoose")
const mainRouter = require("./routers/mainRouter")
require("dotenv").config()

mongoose.connect(process.env.MONGO_KEY)
    .then(() => {
        console.log("DB CONNECT SUCCESS")
    }).catch(err => {
    console.log("ERROR")
    console.log(err)
})

app.use(cors())
app.use(express.json())

app.use("/", mainRouter)

app.listen(2000)
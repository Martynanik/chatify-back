const express = require("express")
const Router = express.Router()

const {
    register,
    login,
    changeProfilePicture,
    changeUsername,
    changePassword,
    getUsers,
    getSingleUser,
    sendMessage,
    getConversations,
    deleteConversation,
    getMessages,
    sendMessageInChat,
    sendLike
} = require("../controllers/mainController")

const {
    registrationValidation,
    loginValidation,
    pictureValidation,
    usernameValidation,
    passwordValidation,
    messageValidation
} = require("../middleWare/validators")

///users
Router.post("/register", registrationValidation, register)
Router.post("/login", loginValidation, login)
Router.post("/changeProfilePicture", pictureValidation, changeProfilePicture)
Router.post("/changeUsername", usernameValidation, changeUsername)
Router.post("/changePassword", passwordValidation, changePassword)
Router.get("/allUsers", getUsers)
Router.get("/singleUser/:username", getSingleUser)

////Messages
Router.post("/sendMessage", messageValidation, sendMessage)
Router.get("/allConversations/:participantId", getConversations)
Router.post("/deleteConversation", deleteConversation)
Router.get("/getMessages/:conversationId", getMessages)
Router.post("/sendMessageInChat", sendMessageInChat)
Router.post("/sendLike", sendLike)

module.exports =  Router
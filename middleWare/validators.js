const jwt = require("jsonwebtoken")
// const {pictureValidation, passwordValidation} = require("../controllers/mainController");

module.exports = {
    registrationValidation: (req,res,next) =>{
        const data = req.body

        if(!("username" in req.body)){
            return res.send({error: true, message: "No username key", data: null})
        }
        if(!("passwordOne" in req.body)){
            return res.send({error: true, message: "No passwordOne key", data: null})
        }
        if(!("passwordTwo" in req.body)){
            return res.send({error: true, message: "No passwordTwo key", data: null})
        }
        if(data.username.length<4 || data.username.length>20){
            return res.send({error: true, message: "Username length must be 4-20 symbols", data: null})
        }
        if(data.passwordOne !== data.passwordTwo){
            return res.send({error: true, message: "Passwords should match", data: null})
        }
        if(data.passwordOne<4 || data.passwordOne>20){
            return res.send({error: true, message: "Password length must be 4-20 symbols", data: null})
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*_+])/;
        if (!passwordRegex.test(data.passwordOne)) {
            return res.send({ error: true, message: "Password must have at least one uppercase letter and one special symbol (!@#$%^&*_+)", data: null });
        }

        next()
    },
    loginValidation: (req,res,next)=>{
        const data = req.body
        if (!data.username || !data.password) {
            return res.send({ error: true, message: 'You must fill username and password forms.' });
        }
        if (typeof data.password !== 'string' || data.password.length < 4 || data.password.length > 20) {
            return res.send({ error: true, message: 'Wrong password.' });
        }
        next();
    },
    pictureValidation: (req, res, next) => {
        const data = req.body;

        if(!("username" in req.body)){
            return res.send({error: true, message: "No username key.", data: null})
        }
        if (!("image" in req.body)) {
            return res.send({ error: true, message: "No image key.", data: null });
        }

        if(!data.image.includes("http")){
            return res.send({ error: true, message: "The provided image URL is not valid.", data: null });

        }
        next();
    },
    usernameValidation: (req, res, next)=>{
        const data = req.body;
        if(!("username" in req.body)){
            return res.send({error: true, message: "No username key.", data: null})
        }
        if(!("newUsername" in req.body)){
            return res.send({error: true, message: "No newUsername key.", data: null})
        }
        if(data.newUsername.length<4 || data.newUsername.length>20){
            return res.send({error: true, message: "Username length must be 4-20 symbols", data: null})
        }
        next();
    },
    passwordValidation: (req, res, next)=>{
        const data = req.body;
        if(!("username" in req.body)){
            return res.send({error: true, message: "No username key.", data: null})
        }
        if(!("currentPassword" in req.body)){
            return res.send({error: true, message: "No currentPassword key.", data: null})
        }
        if(!("passwordOne" in req.body)){
            return res.send({error: true, message: "No passwordOne key.", data: null})
        }
        if(!("passwordTwo" in req.body)){
            return res.send({error: true, message: "No passwordTwo key.", data: null})
        }
        if(data.passwordOne<4 || data.passwordOne>20){
            return res.send({error: true, message: "Password length must be 4-20 symbols", data: null})
        }
        if(data.passwordOne !== data.passwordTwo){
            return res.send({error: true, message: "Passwords should match", data: null})
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*_+])/;
        if (!passwordRegex.test(data.passwordOne)) {
            return res.send({ error: true, message: "Password must have at least one uppercase letter and one special symbol (!@#$%^&*_+)", data: null });
        }
        next();
    },
    messageValidation: (req, res, next)=> {
        const data = req.body;
        if (!("senderId" in req.body)) {
            return res.send({error: true, message: "No senderId key.", data: null})
        }
        if (!("recipientId" in req.body)) {
            return res.send({error: true, message: "No recipientId key.", data: null})
        }
        if (!("text" in req.body)) {
            return res.send({error: true, message: "No text key.", data: null})
        }
        if(data.text.length === 0){
            return res.send({error: true, message: "You can not send empty message", data: null})
        }
        next();
    }
}
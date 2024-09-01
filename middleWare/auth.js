const jwt = require("jsonwebtoken")
module.exports = (req, res, next) => {
    const token = req.headers.authorization

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if(err) {
            res.send({error: true, message: "bad token", data: null})
        } else {
            req.body.user = user
            next()
        }
    })
}

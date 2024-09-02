// const bcrypt = require("bcrypt")
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken")
const usersDb = require("../schemas/userSchema")
const messagesDb = require("../schemas/messageSchema")
const conversationsDb = require("../schemas/conversationSchema")

module.exports = {
    register: async (req,res) => {
        const data = req.body
        try {
            const userExist = await usersDb.findOne({username: data.username})
            if (userExist) {
                res.send({error: true, message: "User already exists.", data: null})
            } else {
                // const salt = await bcrypt.genSalt(10)
                // const passwordHash = await bcrypt.hash(data.passwordOne, salt)
                const salt = bcryptjs.genSaltSync(10);
                const passwordHash = bcryptjs.hashSync(data.passwordOne, salt);

                const newUser = new usersDb({
                    username: data.username,
                    password: passwordHash,
                    image: "https://cdn-icons-png.flaticon.com/512/219/219969.png"
                })
                await newUser.save()
                res.send({error: false, message: "User was registered successfully"})
            }
        } catch (error) {
            // console.error("Error occured: ", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    },
    login: async (req,res) => {
        const {username, password} = req.body
        try {
            const loggedInUser = await usersDb.findOne({username: username})

            if(!loggedInUser){
                return res.send({error: true, message: "There is no such user registered.", data: null})
            }

            // const passValid = await bcrypt.compare(password, loggedInUser.password)

            const passValid = await bcryptjs.compareSync(password, loggedInUser.password)

            if(passValid){
                const data = {
                    id: loggedInUser._id,
                    username: loggedInUser.username,
                }
                const token = jwt.sign(data, process.env.JWT_SECRET)
                const loggedUser = {
                    username: loggedInUser.username,
                    image: loggedInUser.image,
                    _id: loggedInUser._id
                }
                res.send({error: false, message: "Successful login", data: {loggedUser, token}})
            } else {
                res.send({error: true, message: "Bad credentials", data: null})
            }
        } catch (error) {
            console.error("Error occured: ", error);
            return res.json({ error: true, message: error.message });
        }

    },
    changeProfilePicture: async (req, res)=> {
        const {username, image} = req.body
        const updatedUser= await usersDb.findOneAndUpdate(
            {username: username},
            { $set: { image: image } },
            {new: true}
        )
        const userObj = updatedUser.toObject();
        const { password, ...userWithoutPassword } = userObj;
        res.send({error: false, message: "Profile picture changed successfully", data: userWithoutPassword})
    },
    changeUsername: async (req, res)=> {
        const {username, newUsername} = req.body
        const userExist = await usersDb.findOne({username: newUsername})
        if (userExist) {
            res.send({error: true, message: "Username is already taken.", data: null})
        } else {
            const updatedUser= await usersDb.findOneAndUpdate(
                {username: username},
                { $set: { username: newUsername } },
                {new: true}
            )
            const userObj = updatedUser.toObject();
            const { password, ...userWithoutPassword } = userObj;
            res.send({error: false, message: "Username changed successfully", data: userWithoutPassword})
        }
    },
    changePassword: async (req, res)=> {
        const {username, currentPassword, passwordOne, passwordTwo} = req.body
        const loggedInUser = await usersDb.findOne({username: username})
        if(!loggedInUser){
            return res.send({error: true, message: "There is no such user registered.", data: null})
        }
        const passValid = await bcryptjs.compareSync(currentPassword, loggedInUser.password)

        if(passValid){
            const salt = bcryptjs.genSaltSync(10);
            const passwordHash = bcryptjs.hashSync(passwordOne, salt);

            const updatedUser= await usersDb.findOneAndUpdate(
                {username: username},
                { $set: { password: passwordHash } },
                {new: true}
            )
            const userObj = updatedUser.toObject();
            const { password, ...userWithoutPassword } = userObj;
            res.send({error: false, message: "Password changed successfully", data: userWithoutPassword})

        } else {
            res.send({error: true, message: "Current password was put in wrong", data: null})
        }

    },
    getUsers: async (req,res)=>{
        const users = await usersDb.find()
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user.toObject();
            return userWithoutPassword;
        });
        return res.send({error: false, message: "All users", data: usersWithoutPasswords})

    },
    getSingleUser: async (req,res)=>{
        const username = req.params.username;
        let user = await usersDb.findOne({username: username})
        if(!user){
            return res.send({error: true, message: "There is no such user registered.", data: null})
        } else {
            const userObj = user.toObject();
            const { password, ...userWithoutPassword } = userObj;
            return res.send({error: false, message: "User", data: userWithoutPassword})

        }

    },
    sendMessage: async (req,res)=>{
        const data = req.body;
        let sender = await usersDb.findOne({ _id: data.senderId });
        let recipient = await usersDb.findOne({ _id: data.recipientId });

        try {
        if (!sender || !recipient) {
            return res.send({ error: true, message: "There is no such user or recipient registered.", data: null });
        } else {
            // Create a new message
            const newMessage = new messagesDb({
                senderId: data.senderId,
                recipientId: data.recipientId,
                text: data.text
            });
            await newMessage.save();

            let conversation = await conversationsDb.findOne({
                participants: {$all: [data.senderId, data.recipientId]}
            });

            if (conversation) {
                /// If a conversation exists, add the new message to the existing conversation
                conversation.messages.push(newMessage._id)
                await conversation.save();
            } else {
                // If no conversation exists, create a new one
                const newConversation = new conversationsDb({
                    participants: [data.senderId, data.recipientId], // Array with two participants
                    messages: [newMessage._id] // Array with the ID of the newly created message
                });
                await newConversation.save();
            }

                const conversations = await conversationsDb.find({
                    participants: { $in: [data.senderId] }
                });

            //// creating data to update active conversations content and number
                const conversationDetails = await Promise.all(conversations.map(async (conversation) => {
                    const otherParticipantId = conversation.participants.find(id => id.toString() !== data.senderId);

                    // Fetch user details for the other participant
                    const user = await usersDb.findOne({ _id: otherParticipantId });
                    return {
                        conversationId: conversation._id.toString(),
                        otherParticipantId:  otherParticipantId.toString(),
                        username: user.username,
                        image: user.image
                    };
                }));

                return res.send({ error: false, message: "Message send successfully", data: {conversationDetails} });

        } } catch (error) {
                console.error("Error sending message:", error);
                return res.send({ error: true, message: "error occured", data: "" });
            }

    },
    getConversations: async (req,res)=>{
        const participantId = req.params.participantId;
        try {
            const conversations = await conversationsDb.find({
                participants: { $in: [participantId] }
            });

            // Prepare an array of  user details for other participants that would be displayed as active conversations with images and usernames
            const conversationDetails = await Promise.all(conversations.map(async (conversation) => {
                const otherParticipantId = conversation.participants.find(id => id.toString() !== participantId);
                const user = await usersDb.findOne({ _id: otherParticipantId });

                return {
                    conversationId: conversation._id.toString(),
                    otherParticipantId: otherParticipantId.toString(),
                    username: user.username,
                    image: user.image
                };
            }));

            return res.send({ error: false, message: "Conversations retrieved", data: {conversationDetails} });

        } catch (error) {
            console.error("Error fetching conversations:", error);
            return res.send({ error: true, message: "error", data: "" });
        }
    },
    deleteConversation: async (req, res) => {
        const { convId, participantId } = req.body;

        let conversationExist = await conversationsDb.findOne({ _id: convId });

        if (!conversationExist) {
            return res.send({ error: true, message: "Such conversation doesn't exist", data: "" });
        } else {
            const { participants } = conversationExist;

            if (participants.length !== 2) {
                return res.send({ error: true, message: "Invalid number of participants", data: "" });
            }

            const [user1, user2] = participants;
            await messagesDb.deleteMany({
                $or: [
                    { senderId: user1, recipientId: user2 },
                    { senderId: user2, recipientId: user1 }
                ]
            });

            await conversationsDb.findOneAndDelete({ _id: convId });

            //// sending data back to update active conversations
            const conversations = await conversationsDb.find({
                participants: { $in: [participantId] }
            });

            const conversationDetails = await Promise.all(conversations.map(async (conversation) => {
                const otherParticipantId = conversation.participants.find(id => id.toString() !== participantId);
                const user = await usersDb.findOne({ _id: otherParticipantId });

                return {
                    conversationId: conversation._id.toString(),
                    otherParticipantId: otherParticipantId.toString(),
                    username: user.username,
                    image: user.image
                };
            }));

            return res.send({ error: false, message: "Conversation and its messages deleted", data: { conversationDetails } });
        }
    },
    getMessages: async (req,res)=>{
        const conversationId = req.params.conversationId;
        let conversation = await conversationsDb.findOne({_id: conversationId}).populate("messages")
        const messages = conversation.messages
        return res.send({ error: false, message: "Messages retrieved", data: messages });

    },
    sendMessageInChat: async (req,res)=>{
        const data = req.body;

        let sender = await usersDb.findOne({ _id: data.senderId });
        let recipient = await usersDb.findOne({ _id: data.recipientId });

        try {
            if (!sender || !recipient) {
                return res.send({error: true, message: "There is no such user or recipient registered.", data: null});
            } else {
                const newMessage = new messagesDb({
                    senderId: data.senderId,
                    recipientId: data.recipientId,
                    text: data.text
                });
                await newMessage.save();

                let conversation = await conversationsDb.findOne({
                    participants: {$all: [data.senderId, data.recipientId]}
                });
                conversation.messages.push(newMessage._id)
                await conversation.save();

                const updatedConversation = await conversationsDb.findOne({_id: data.conversationId}).populate("messages")
                const messages = updatedConversation.messages
                //// sending back updated messages to update chat that has been changed
                return res.send({ error: false, message: "Message send successfully", data: messages });

            }
        }  catch (error) {
        console.error("Error sending message in chat:", error);
        return res.send({ error: true, message: "Error occured", data: null });
    }
    },
    sendLike: async (req,res)=>{
        const { messageId, conversationId } = req.body;
        try {
            const updatedMessage = await messagesDb.findOneAndUpdate(
                { _id: messageId },
                [{ $set: { like: { $not: "$like" } } }],
                { new: true }
            );

            if (updatedMessage) {
                let conversation = await conversationsDb.findOne({_id: conversationId}).populate("messages")
                const messages = conversation.messages
                return res.send({ error: false, message: "Message liked or unliked", data: messages });

            } else {
                return res.send({ error: true, message: "Message not found", data: null });
            }
        } catch (error) {
            console.error("Error updating message:", error);
            return res.send({ error: true, message: "Error occured", data: null });

        }
    }

}
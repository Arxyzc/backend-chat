import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessagesModel.js"

export const searchContacts = async (request, response, next) => {
    try {    
        const {searchTerm} = request.body;

        if (searchTerm === undefined || searchTerm === null) {
            return response.status(400).send("Se requiere término de búsqueda.")
        }
        
        const sanitizedSearchTerm = searchTerm.replace (
            /[.*+?^${}()|[/]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(sanitizedSearchTerm, "i");

        const contacts = await User.find({
            $and: [{ _id: { $ne: request.userId } },
                {
                    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
                },
            ],
        });

        return response.status(200).json({ contacts });

        return response.status(200).send("La sesión fue cerrada exitosamente");
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Error interno del servidor.");
    }
};

export const getContactsForDMList = async (request, response, next) => {
    try {    
        let { userId } = request;
        userId = new mongoose.Types.ObjectId(userId);

        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { recipient: userId }],
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$recipient",
                            else: "$sender",
                        },
                    },
                    lastMessagesTime: { $first: "$timestamp" },
                },
            },
            {$lookup:{
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfo",
                },
            },
            {
                $unwind: "$contactInfo",
            },
            {
                $project: {
                    _id: 1,
                    lastMessagesTime: 1,
                    email: "$contactInfo.email",
                    firstName: "$contactInfo.firstName",
                    lastName: "$contactInfo.lastName",
                    image: "$contactInfo.image",
                    color: "$contactInfo.color",
                },
            },
            {
                $sort: { lastMessagesTime: -1 },
            },
        ]);

        return response.status(200).json({ contacts });

    } catch (error) {
        console.log({ error });
        return response.status(500).send("Error interno del servidor.");
    }
};

export const getAllContacts = async (request, response, next) => {
    try {    
        const users = await User.find({ _id: { $ne: request.userId } }, "firstName lastName _id email");

        const contacts = users.map((user) => ({
            label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
            value: user._id,
        }));

        return response.status(200).json({ contacts });

    } catch (error) {
        console.log({ error });
        return response.status(500).send("Error interno del servidor.");
    }
};
import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const EVENTS = {
    CONNECTION: "connection",
    DISCONNECT: "disconnect",
    SEND_MESSAGE: "sendMessage",
    RECIEVE_MESSAGE: "recieveMessage",
    SEND_CHANNEL_MESSAGE: "send-channel-message",
    RECIEVE_CHANNEL_MESSAGE: "recieve-channel-message",
};

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                "https://chatdemo-react.netlify.app",
            ],
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    const userSocketMap = new Map();

    const disconnect = (socket) => {
        console.log(`Cliente Desconectado: ${socket.id}`);
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    };

    const sendMessage = async (message) => {
        try {
            const senderSocketId = userSocketMap.get(message.sender);
            const recipientSocketId = userSocketMap.get(message.recipient);

            const createdMessage = await Message.create(message);

            const messageData = await Message.findById(createdMessage._id)
                .populate("sender", "id email firstName lastName image color")
                .populate("recipient", "id email firstName lastName image color");

            if (recipientSocketId) {
                io.to(recipientSocketId).emit(EVENTS.RECIEVE_MESSAGE, messageData);
            }
            if (senderSocketId) {
                io.to(senderSocketId).emit(EVENTS.RECIEVE_MESSAGE, messageData);
            }
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
        }
    };

    const sendChannelMessage = async (message) => {
        // Igual que tu lógica actual, añadiendo manejo de errores.
    };

    io.on(EVENTS.CONNECTION, (socket) => {
        const userId = socket.handshake.query.userId;

        if (!userId) {
            console.log("ID de usuario no proporcionado. Cerrando conexión.");
            socket.disconnect(true);
            return;
        }

        userSocketMap.set(userId, socket.id);
        console.log(`Usuario conectado: ${userId} con ID: ${socket.id}`);

        socket.on(EVENTS.SEND_MESSAGE, sendMessage);
        socket.on(EVENTS.SEND_CHANNEL_MESSAGE, sendChannelMessage);
        socket.on(EVENTS.DISCONNECT, () => disconnect(socket));
    });
};

export default setupSocket;

/*import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: [
                "http://localhost:5173", // Origen de desarrollo
                "https://chatdemo-react.netlify.app", // Origen de producción
            ],
            methods: ["GET", "POST"],
            credentials: true, // Permitir cookies y encabezados de autenticación
        },
    });

    const userSocketMap = new Map();

    const disconnect = (socket) => {
        console.log(`Cliente Desconectado: ${socket.id}`);
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    };

    const sendMessage = async (message) => {
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName image color")
            .populate("recipient", "id email firstName lastName image color");

        if (recipientSocketId) {
            io.to(recipientSocketId).emit("recieveMessage", messageData);
        }
        if (senderSocketId) {
            io.to(senderSocketId).emit("recieveMessage", messageData);
        }
    };

    const sendChannelMessage = async (message) => {
        const { channelId, sender, content, messageType, fileUrl } = message;

        const createdMessage = await Message.create({
            sender,
            recipient: null,
            content,
            messageType,
            timestamp: new Date(),
            fileUrl,
        });

        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName image color")
            .exec();

        await Channel.findByIdAndUpdate(channelId, {
            $push: { messages: createdMessage._id },
        });

        const channel = await Channel.findById(channelId).populate("members");

        const finalData = { ...messageData._doc, channelId: channel._id };

        if (channel && channel.members) {
            channel.members.forEach((member) => {
                const memberSocketId = userSocketMap.get(member._id.toString());
                if (memberSocketId) {
                    io.to(memberSocketId).emit("recieve-channel-message", finalData);
                }
            });
            const adminSocketId = userSocketMap.get(channel.admin._id.toString());
            if (adminSocketId) {
                io.to(adminSocketId).emit("recieve-channel-message", finalData);
            }
        }
    };

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`Usuario conectado: ${userId} con ID: ${socket.id}`);
        } else {
            console.log("ID de usuario no proporcionado durante la conexión.");
        }

        socket.on("sendMessage", sendMessage);
        socket.on("send-channel-message", sendChannelMessage);
        socket.on("disconnect", () => disconnect(socket));
    });
};

export default setupSocket;*/

/*import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    const userSocketMap = new Map();

    const disconnect = (socket) => {
        console.log( `Cliente Desconectado: ${socket.id}` );
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    };

    const sendMessage = async (message) => {
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "id email fistName lastName image color")
            .populate("recipient", "id email fistName lastName image color");

            if (recipientSocketId) {
                io.to(recipientSocketId).emit("recieveMessage", messageData);
            }
            if(senderSocketId) {
                io.to(senderSocketId).emit("recieveMessage", messageData);
            }
    };

    const sendChannelMessage = async (message) => {
        const { channelId, sender, content, messageType, fileUrl } = message;

        const createdMessage = await Message.create({
            sender,
            recipient: null,
            content,
            messageType,
            timestamp: new Date(),
            fileUrl,
        });

        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName image color")
            .exec();

            await Channel.findByIdAndUpdate(channelId, {
                $push: { messages: createdMessage._id },
            });

            const channel = await Channel.findById(channelId).populate("members");

            const finalData = { ...messageData._doc, channelId: channel._id };

            if (channel && channel.members) {
                channel.members.forEach((member) => {
                    const memberSocketId = userSocketMap.get(member._id.toString());
                    if (memberSocketId) {
                        io.to(memberSocketId).emit("recieve-channel-message", finalData);
                    }
                });
                const adminSocketId = userSocketMap.get(channel.admin._id.toString());
                if (adminSocketId) {
                    io.to(adminSocketId).emit("recieve-channel-message", finalData);
                }
            }
    };

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`Usuario conectado: ${userId} con ID: ${socket.id}`);
        } else {
            console.log("ID de usuario no proporcionado durante la conexión.");
        }

        socket.on("sendMessage", sendMessage);
        socket.on("send-channel-message", sendChannelMessage);
        socket.on("disconnect", () => disconnect(socket));
    });
};

export default setupSocket;*/
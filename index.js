import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routers/AuthRoutes.js";
import contactsRoutes from "./routers/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routers/MessagesRoutes.js";
import channelRoutes from "./routers/ChannelRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(
    cors({
        origin: [process.env.ORIGIN],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true, // Esto permite compartir credenciales
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);

const server = app.listen(port, () => {
    console.log(`El servidor está funcionando http://localhost:${port}`);
});

setupSocket(server);

mongoose.connect(databaseURL, {
    serverSelectionTimeoutMS: 30000, // Esto aumenta el tiempo de espera para la conexión
})
.then(() => console.log("Conexión de base de datos exitosa"))
.catch((err) => console.error("Error de conexión:", err));

// mongoose
//     .connect(databaseURL)
//     .then(() => console.log("Conexión de base de datos exitosa"))
//     .catch((err) => console.log(err.message));
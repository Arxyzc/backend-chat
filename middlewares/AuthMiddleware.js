import jwt from "jsonwebtoken";

export const verifyToken = (request, response, next) => {
    const token = request.cookies.jwt;
    if (!token) return response.status(401).send("No estas autenticado!")
    jwt.verify(token, process.env.JWT_KEY, async(err,payload) => {
        if (err) return response.status(403).send("Token no es valido!");
        request.userId = payload.userId;
        next();
    });
};
import express from 'express';
const app=express();
import authRoutes from './routes/auth.route.js';
import messageRoute from './routes/message.routes.js';

import dotenv from 'dotenv';
import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser';
dotenv.config();
import cors from "cors";

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use('/api/auth', authRoutes);
app.use("/api/message",messageRoute);
const PORT=process.env.PORT
app.listen(PORT, () =>
{
    console.log("Server is running on port:",PORT);
    connectDB();
});
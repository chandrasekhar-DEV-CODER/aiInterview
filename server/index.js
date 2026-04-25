import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/connectDb.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import interviewRouter from './routes/interview.route.js';
dotenv.config()


const app=express()
app.use(cors({
    origin: "http://localhost:5173", // ⚠️ Check your browser: if it says 127.0.0.1, change this!
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json())
app.use(cookieParser())




const port=process.env.port||8000

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/interview",interviewRouter)


app.get("/",(req,res)=>{
    return res.json({message:"server started"})
})

app.listen(port,()=>{
  console.log(`server has started on ${port}`)
  connectDB()
})
import express from "express";
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js';
import userRouter from "./routes/userRoutes.js";
import adminRouter from './routes/adminRoutes.js';
import stockRouter from './routes/stockRoutes.js';
import cashbackRouter from './routes/cashbackRoutes.js';

const app = express();
const port = process.env.PORT || 8000
connectDB();

app.use(cors({
    origin: [
        "http://localhost:5173",              // local dev (Vite)
        "https://mudra-pay-mern.vercel.app"       // ✅ your Vercel frontend URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("API Working...")
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter);
app.use('/api/stocks', stockRouter);
app.use('/api/cashback', cashbackRouter);

app.listen(port, ()=> console.log(`✅ Server started on PORT: ${port}`))

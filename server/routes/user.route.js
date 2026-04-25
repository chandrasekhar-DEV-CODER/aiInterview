import express from "express";
import isAuth from "../middleware/isAuth.js";
import User from "../models/user.model.js";
import { getCurrentUser } from "../controllers/user.controller.js";


const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);

export default userRouter;
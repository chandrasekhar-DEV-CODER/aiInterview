import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const googleAuth = async (req, res) => {
  try {
    const { name, email, photo } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      // Generate a unique username to avoid MongoDB duplicate key errors
      const generatedUsername = name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4);
      
      const generatedPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      user = await User.create({ 
        username: generatedUsername, 
        name, 
        email, 
        password: hashedPassword,
        profilePicture: photo 
      });
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true only in production
      sameSite: "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...rest } = user._doc;
    res.status(200).json({ ...rest, token });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔥 This was the missing function causing your crash!
export const logOut = (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
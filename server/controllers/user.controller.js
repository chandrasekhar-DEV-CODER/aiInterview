import User from "../models/User.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // set by isAuth middleware
    const user = await User.findById(userId).select("-password"); // exclude password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user); // full user object
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

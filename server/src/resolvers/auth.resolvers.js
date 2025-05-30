import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export default {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await User.findById(user.id).populate("teams");
    },
    getRecentActivity: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      
      return await Activity.find({ user: user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user");
    },
  },
  Mutation: {
    register: async (_, { input }) => {
      const existing = await User.findOne({ email: input.email });
      if (existing) throw new Error("User already exists");

      const hashed = await bcrypt.hash(input.password, 10);
      const user = await User.create({ ...input, password: hashed });
      const token = generateToken(user);
      
      return { 
        token, 
        user: await user.populate("teams")
      };
    },

    login: async (_, { input }) => {
      const user = await User.findOne({ email: input.email });
      if (!user) throw new Error("Invalid credentials");

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) throw new Error("Invalid credentials");

      const token = generateToken(user);
      await user.populate("teams");
      
      return { 
        token, 
        user 
      };
    },
  },
};

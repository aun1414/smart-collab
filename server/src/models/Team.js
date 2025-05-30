import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Team = mongoose.model("Team", teamSchema);
export default Team;

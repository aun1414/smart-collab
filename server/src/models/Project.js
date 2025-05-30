import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Completed", "On Hold"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Project = mongoose.model("Project", projectSchema);
export default Project;

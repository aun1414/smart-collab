import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["project_created", "project_deleted", "task_created", "task_completed", "team_created", "team_joined", "document_uploaded"],
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  relatedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Activity = mongoose.model("Activity", activitySchema);
export default Activity; 
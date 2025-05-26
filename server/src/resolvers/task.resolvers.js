import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

export default {
  Query: {
    getTasks: async (_, { projectId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const project = await Project.findById(projectId);
      if (!project) throw new Error("Project not found");

      return await Task.find({ project: projectId })
        .populate("project")
        .populate("assignedTo")
        .populate("createdBy");
    },
  },

  Mutation: {
    createTask: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const project = await Project.findById(input.projectId);
      if (!project) throw new Error("Project not found");

      const task = await Task.create({
        name: input.name,
        project: input.projectId,
        assignedTo: input.assignedTo || null,
        status: input.status || "Todo",
        createdBy: user.id,
      });

      await task.populate("project");
      await task.populate("assignedTo");
      await task.populate("createdBy");

      return task;
    },
    
    updateTaskStatus: async (_, { taskId, status }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const task = await Task.findById(taskId);
      if (!task) throw new Error("Task not found");

      // Optional: only allow user to update tasks in their own project/team
      task.status = status;
      await task.save();

      return task;
    }

  },
};

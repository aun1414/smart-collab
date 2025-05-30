import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Activity from "../models/Activity.js";

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
    getProjectTasksGrouped: async (_, { projectId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const tasks = await Task.find({ project: projectId })
        .populate("assignedTo")
        .populate("createdBy");

      return {
        Todo: tasks.filter(task => task.status === "Todo"),
        InProgress: tasks.filter(task => task.status === "InProgress"),
        Done: tasks.filter(task => task.status === "Done"),
      };
    },
    getMyTasks: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");

      // Get all teams the user belongs to
      const userTeams = await Team.find({ members: user.id });
      const teamIds = userTeams.map(team => team._id);
      
      // Get all projects in those teams
      const projects = await Project.find({ team: { $in: teamIds } });
      const projectIds = projects.map(project => project._id);
      
      // Find all tasks in those projects that are assigned to the user
      return await Task.find({ 
        $or: [
          { assignedTo: user.id },
          { createdBy: user.id, project: { $in: projectIds } }
        ]
      })
        .populate("project")
        .populate("assignedTo")
        .populate("createdBy");
    },
  },

  Mutation: {
    createTask: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const project = await Project.findById(input.projectId).populate("team");
      if (!project) throw new Error("Project not found");

      // Check if user is member of the project's team
      const team = await Team.findById(project.team);
      if (!team || !team.members.includes(user.id)) {
        throw new Error("You're not authorized to create tasks in this project");
      }

      const task = await Task.create({
        name: input.name,
        project: input.projectId,
        assignedTo: input.assignedTo || user.id,
        createdBy: user.id,
        status: input.status || "Todo",
      });

      await task.populate("project");
      await task.populate("assignedTo");
      await task.populate("createdBy");

      // Log activity
      await Activity.create({
        type: "task_created",
        description: `Created task "${task.name}" in project "${project.name}"`,
        user: user.id,
        relatedTask: task._id,
        relatedProject: project._id,
      });

      return task;
    },
    updateTaskStatus: async (_, { taskId, status }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const task = await Task.findById(taskId).populate("project");
      if (!task) throw new Error("Task not found");

      const oldStatus = task.status;
      task.status = status;
      await task.save();

      await task.populate("assignedTo");
      await task.populate("createdBy");

      // Log activity for task completion
      if (status === "Done" && oldStatus !== "Done") {
        await Activity.create({
          type: "task_completed",
          description: `Completed task "${task.name}" in project "${task.project.name}"`,
          user: user.id,
          relatedTask: task._id,
          relatedProject: task.project._id,
        });
      }

      return task;
    },
    deleteTask: async (_, { taskId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const task = await Task.findById(taskId);
      if (!task) throw new Error("Task not found");

      if (String(task.createdBy) !== user.id) {
        throw new Error("Not authorized to delete this task");
      }

      await task.deleteOne();
      return true;
    },
  },
};

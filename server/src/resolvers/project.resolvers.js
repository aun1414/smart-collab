import Project from "../models/Project.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import Document from "../models/Document.js";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";

export default {
  Query: {
    getProjects: async (_, { teamId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      if (teamId) {
        const team = await Team.findById(teamId);
        if (!team || !team.members.includes(user.id)) {
          throw new Error("You're not a member of this team");
        }

        return await Project.find({ team: teamId })
          .populate("team")
          .populate("createdBy");
      } else {
        // If no teamId provided, return all projects for user's teams
        const userTeams = await Team.find({ members: user.id });
        const teamIds = userTeams.map(team => team._id);
        
        return await Project.find({ team: { $in: teamIds } })
          .populate("team")
          .populate("createdBy");
      }
    },
    getMyProjects: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");

      // Get all teams the user belongs to
      const userTeams = await Team.find({ members: user.id });
      const teamIds = userTeams.map(team => team._id);
      
      // Find all projects in those teams
      return await Project.find({ team: { $in: teamIds } })
        .populate("team")
        .populate("createdBy");
    },
  },

  Mutation: {
    createProject: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const team = await Team.findById(input.teamId);
      if (!team || !team.members.includes(user.id)) {
        throw new Error("You're not authorized to create projects in this team");
      }

      const project = await Project.create({
        name: input.name,
        team: input.teamId,
        createdBy: user.id,
        status: "Active", // Default status
      });

      await project.populate("team");
      await project.populate("createdBy");

      // Log activity
      await Activity.create({
        type: "project_created",
        description: `Created project "${project.name}" in team "${team.name}"`,
        user: user.id,
        relatedProject: project._id,
        relatedTeam: team._id,
      });

      return project;
    },
    deleteProject: async (_, { projectId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const project = await Project.findById(projectId).populate("team");
      if (!project) throw new Error("Project not found");
      
      if (String(project.createdBy) !== user.id) {
        throw new Error("Not authorized to delete this project");
      }

      await Task.deleteMany({ project: projectId });
      await Document.deleteMany({ project: projectId });
      
      // Log activity before deleting
      await Activity.create({
        type: "project_deleted",
        description: `Deleted project "${project.name}" from team "${project.team.name}"`,
        user: user.id,
        relatedTeam: project.team._id,
      });

      await project.deleteOne();

      return true;
    }
  },
};

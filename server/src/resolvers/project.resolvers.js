import Project from "../models/Project.js";
import Team from "../models/Team.js";
import User from "../models/User.js";

export default {
  Query: {
    getProjects: async (_, { teamId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const team = await Team.findById(teamId);
      if (!team || !team.members.includes(user.id)) {
        throw new Error("You're not a member of this team");
      }

      return await Project.find({ team: teamId })
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
      });

      await project.populate("team");
      await project.populate("createdBy");

      return project;
    },
  },
};

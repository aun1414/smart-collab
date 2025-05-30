import Team from "../models/Team.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Document from "../models/Document.js";
import Activity from "../models/Activity.js";

export default {
    Query: {
        getMyTeams: async (_, __, { user }) => {
        if (!user) throw new Error("Not authenticated");
    
        const teams = await Team.find({ members: user.id }).populate(["owner", "members"]);
        return teams;
        },
    }, 
  Mutation: {
    createTeam: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const newTeam = await Team.create({
        name: input.name,
        description: input.description,
        owner: user.id,
        members: [user.id],
      });

      await User.findByIdAndUpdate(user.id, {
        $push: { teams: newTeam._id },
      });

      await newTeam.populate("owner");
      await newTeam.populate("members");

      // Log activity
      await Activity.create({
        type: "team_created",
        description: `Created team "${newTeam.name}"`,
        user: user.id,
        relatedTeam: newTeam._id,
      });

      return newTeam;
    },
    inviteMember: async (_, { teamId, email }, { user }) => {
        if (!user) throw new Error("Not authenticated");

        const team = await Team.findById(teamId);
        if (!team) throw new Error("Team not found");

        // Make sure the user is a member of this team
        if (!team.members.includes(user.id)) {
            throw new Error("You're not authorized to invite users to this team");
        }

        // Find user to invite
        const invitee = await User.findOne({ email });
        if (!invitee) throw new Error("User with this email does not exist");

        // Prevent re-inviting
        if (team.members.includes(invitee._id)) {
            throw new Error("User is already a member of this team");
        }

        // Add to team
        team.members.push(invitee._id);
        await team.save();

        // Add team to user
        invitee.teams.push(team._id);
        await invitee.save();

        await team.populate("owner");
        await team.populate("members");

        // Log activity
        await Activity.create({
          type: "team_joined",
          description: `${invitee.name} joined team "${team.name}"`,
          user: invitee._id,
          relatedTeam: team._id,
        });

        return team;
    },
    inviteUserToTeam: async (_, { email, teamId }, { user }) => {
        if (!user) throw new Error("Not authenticated");

        const team = await Team.findById(teamId);
        if (!team) throw new Error("Team not found");

        // Make sure the user is a member of this team
        if (!team.members.includes(user.id)) {
            throw new Error("You're not authorized to invite users to this team");
        }

        // Find user to invite
        const invitee = await User.findOne({ email });
        if (!invitee) throw new Error("User with this email does not exist");

        // Prevent re-inviting
        if (team.members.includes(invitee._id)) {
            throw new Error("User is already a member of this team");
        }

        // Add to team
        team.members.push(invitee._id);
        await team.save();

        // Add team to user
        invitee.teams.push(team._id);
        await invitee.save();

        await team.populate("owner");
        await team.populate("members");

        // Log activity
        await Activity.create({
          type: "team_joined",
          description: `${invitee.name} joined team "${team.name}"`,
          user: invitee._id,
          relatedTeam: team._id,
        });

        return team;
    },
    deleteTeam: async (_, { teamId }, { user }) => {
        if (!user) throw new Error("Not authenticated");

        const team = await Team.findById(teamId);
        if (!team) throw new Error("Team not found");

        if (String(team.owner) !== user.id) {
          throw new Error("Not authorized to delete this team");
        }

        // Delete all projects in the team and their associated content
        const projects = await Project.find({ team: teamId });
        const projectIds = projects.map(p => p._id);

        await Task.deleteMany({ project: { $in: projectIds } });
        await Document.deleteMany({ project: { $in: projectIds } });
        await Project.deleteMany({ team: teamId });

        // Remove team from all users
        await User.updateMany(
          { teams: teamId },
          { $pull: { teams: teamId } }
        );

        await team.deleteOne();

        return true;
      }
  },
};

import Team from "../models/Team.js";
import User from "../models/User.js";

export default {
    Query: {
        getMyTeams: async (_, __, { user }) => {
        if (!user) throw new Error("Not authenticated");
    
        const teams = await Team.find({ members: user.id }).populate("owner").populate("members");;
        return teams;
        },
    }, 
  Mutation: {
    createTeam: async (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const newTeam = await Team.create({
        name: input.name,
        owner: user.id,
        members: [user.id],
      });

      await User.findByIdAndUpdate(user.id, {
        $push: { teams: newTeam._id },
      });

      return newTeam.populate("owner").populate("members");
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

        await team.populate("owner")
        await team.populate("members");
        return team
        }

  },
};

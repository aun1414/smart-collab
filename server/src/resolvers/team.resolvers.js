import Team from "../models/Team.js";
import User from "../models/User.js";

export default {
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

      return newTeam;
    },
  },

  Team: {
    owner: async (parent) => await User.findById(parent.owner),
    members: async (parent) => await User.find({ _id: { $in: parent.members } }),
  },
};

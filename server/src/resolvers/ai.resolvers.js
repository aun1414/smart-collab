import { summarizeText } from "../ai/gemini.js";

export default {
  Query: {
    summarizeDemo: async (_, { text }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await summarizeText(text);
    },
  },
};

import { summarizeText } from "../ai/gemini.js";
import Document from "../models/Document.js";
import Task from "../models/Task.js";


export default {
  Query: {
    summarizeDemo: async (_, { text }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const cacheKey = `summary:${text.slice(0, 50)}`;

      const cached = await redis.get(cacheKey);
      if (cached) return cached;

      const summary = await summarizeText(text);
      await redis.set(cacheKey, summary, "EX", 3600); // Cache for 1 hour

      return summary;
    },
  },
  Mutation: {
    suggestAndSaveTasks: async (_, { documentId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const document = await Document.findById(documentId).populate("project");
      if (!document) throw new Error("Document not found");

      const prompt = `
  You're an intelligent project assistant.
  Based on the following project summary, suggest a list of 5–10 clear, actionable development tasks the team should perform to complete the project.
  Only return the list. No explanation.

  Summary:
  ${document.summary}
      `;

      const raw = await summarizeText(prompt);

      const lines = raw
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.startsWith("*") || line.match(/^\d+\./))
        .map(line => line.replace(/^(\*|\d+\.)\s*/, "").trim());

      const savedTasks = await Promise.all(
        lines.map(taskName =>
          Task.create({
            name: taskName,
            project: document.project._id,
            status: "Todo",
            createdBy: user.id,
          })
        )
      );

      return savedTasks;
    }
  }
};

import Document from "../models/Document.js";
import Project from "../models/Project.js";

export default {
  Query: {
    getProjectDocuments: async (_, { projectId }, { user }) => {
      if (!user) throw new Error("Not authenticated");

      const project = await Project.findById(projectId);
      if (!project) throw new Error("Project not found");

      return await Document.find({ project: projectId })
        .populate("uploadedBy")
        .populate("project")
        .sort({ createdAt: -1 }); // latest first
    },
  },
};

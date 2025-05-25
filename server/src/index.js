// server/src/index.js
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import Document from "./models/Document.js";
//import Redis from "ioredis";

import connectDB from "./utils/db.js"; 

import authTypeDefs from "./typeDefs/auth.typeDefs.js";
import authResolvers from "./resolvers/auth.resolvers.js";
import { verifyToken } from "./middleware/verifyToken.js";
import teamTypeDefs from "./typeDefs/team.typeDefs.js";
import teamResolvers from "./resolvers/team.resolvers.js";
import projectTypeDefs from "./typeDefs/project.typeDefs.js";
import projectResolvers from "./resolvers/project.resolvers.js";
import taskTypeDefs from "./typeDefs/task.typeDefs.js";
import taskResolvers from "./resolvers/task.resolvers.js";
import aiTypeDefs from "./typeDefs/ai.typeDefs.js";
import aiResolvers from "./resolvers/ai.resolvers.js";
import { upload } from "./utils/upload.js";
import { extractTxt } from "./utils/textExtractor.js";
import { summarizeText } from "./ai/gemini.js";
import documentTypeDefs from "./typeDefs/document.typeDefs.js";
import documentResolvers from "./resolvers/document.resolvers.js";
import fs from "fs";




dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Redis client
//export const redis = new Redis(process.env.REDIS_URL);

// Middleware
app.use(cors());
app.use(express.json());
app.use(verifyToken);

const typeDefs = [
  authTypeDefs,
  teamTypeDefs,
  projectTypeDefs,
  taskTypeDefs,
  aiTypeDefs,
  documentTypeDefs, 
];

const resolvers = [
  authResolvers,
  teamResolvers,
  projectResolvers,
  taskResolvers,
  aiResolvers, 
  documentResolvers,
];


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({user: req.user}),
});

await server.start();
server.applyMiddleware({ app });

//Connect to DB and Start Server
connectDB().then(() => {
  const httpServer = http.createServer(app);
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
});

// File upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const projectId = req.body.projectId;
    const userId = req.user.id; 

    const text = await extractTxt(req.file.path);
    const summary = await summarizeText(text);

    fs.unlinkSync(req.file.path); // clean up temp file

    const doc = await Document.create({
      name: req.file.originalname,
      summary,
      project: projectId,
      uploadedBy: userId,
    });

    res.json({ message: "Document uploaded & summarized", document: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


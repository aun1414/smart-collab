// server/src/index.js
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
//import Redis from "ioredis";

import connectDB from "./utils/db.js"; 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Redis client
//export const redis = new Redis(process.env.REDIS_URL);

// Middleware
app.use(cors());
app.use(express.json());

// GraphQL placeholders
const typeDefs = `type Query { hello: String }`;
const resolvers = { Query: { hello: () => "Hello world!" } };

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({}),
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

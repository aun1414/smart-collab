const { gql } = await import("apollo-server-express");

const projectTypeDefs = gql`
  type Project {
    _id: ID!
    name: String!
    team: Team!
    createdBy: User!
    createdAt: String!
  }

  input CreateProjectInput {
    name: String!
    teamId: ID!
  }

  type Query {
    getProjects(teamId: ID!): [Project!]!
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project
    deleteProject(projectId: ID!): Boolean

  }
`;

export default projectTypeDefs;

const { gql } = await import("apollo-server-express");

const authTypeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    teams: [Team!]!
  }

  type Activity {
    _id: ID!
    type: String!
    description: String!
    user: User!
    createdAt: String!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    getRecentActivity: [Activity!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload
    login(input: LoginInput!): AuthPayload
  }
`;

export default authTypeDefs;

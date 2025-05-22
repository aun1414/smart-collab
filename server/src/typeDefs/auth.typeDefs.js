const { gql } = await import("apollo-server-express");

const authTypeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    token: String
  }

  input SignupInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    signup(input: SignupInput!): User
    login(input: LoginInput!): User
  }
`;

export default authTypeDefs;

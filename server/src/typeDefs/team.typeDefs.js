const { gql } = await import("apollo-server-express");

const teamTypeDefs = gql`
  type Team {
    _id: ID!
    name: String!
    owner: User!
    members: [User!]!
    createdAt: String!
  }

  input CreateTeamInput {
    name: String!
  }

  type Mutation {
    createTeam(input: CreateTeamInput!): Team
  }
`;

export default teamTypeDefs;

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

  type Query {getMyTeams: [Team!]!}
  
  type Mutation {
      createTeam(input: CreateTeamInput!): Team
      inviteUserToTeam(email: String!, teamId: ID!): Team
      deleteTeam(teamId: ID!): Boolean
  }
`;

export default teamTypeDefs;

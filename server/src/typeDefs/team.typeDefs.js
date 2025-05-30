const { gql } = await import("apollo-server-express");

const teamTypeDefs = gql`
  type Team {
    _id: ID!
    name: String!
    description: String
    owner: User!
    members: [User!]!
    createdAt: String!
  }

  input CreateTeamInput {
    name: String!
    description: String
  }

  type Query {getMyTeams: [Team!]!}
  
  type Mutation {
      createTeam(input: CreateTeamInput!): Team
      inviteMember(teamId: ID!, email: String!): Team
      inviteUserToTeam(email: String!, teamId: ID!): Team
      deleteTeam(teamId: ID!): Boolean
  }
`;

export default teamTypeDefs;

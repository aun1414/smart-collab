const { gql } = await import("apollo-server-express");

const aiTypeDefs = gql`
  type Query {
    summarizeDemo(text: String!): String
  }

  type Mutation {
    summarizeDemo(text: String!): String
    suggestAndSaveTasks(documentId: ID!): [Task!]!
  }

  
`;

export default aiTypeDefs;

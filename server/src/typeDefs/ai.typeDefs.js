const { gql } = await import("apollo-server-express");

const aiTypeDefs = gql`
  type Query {
    summarizeDemo(text: String!): String
  }
`;

export default aiTypeDefs;

const { gql } = await import("apollo-server-express");

const documentTypeDefs = gql`
  type Document {
    _id: ID!
    name: String!
    summary: String!
    project: Project!
    uploadedBy: User!
    createdAt: String!
  }

  type Query {
    getProjectDocuments(projectId: ID!): [Document!]!
  }
`;

export default documentTypeDefs;

const { gql } = await import("apollo-server-express");

const taskTypeDefs = gql`
  enum TaskStatus {
    Todo
    InProgress
    Done
  }

  type Task {
    _id: ID!
    name: String!
    project: Project!
    assignedTo: User
    createdBy: User!
    status: TaskStatus!
    createdAt: String!
  }

  input CreateTaskInput {
    name: String!
    projectId: ID!
    assignedTo: ID
    status: TaskStatus
  }

  type Query {
    getTasks(projectId: ID!): [Task!]!
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task
  }
`;

export default taskTypeDefs;

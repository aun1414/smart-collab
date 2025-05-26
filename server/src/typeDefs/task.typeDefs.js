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

  type TaskGroupResult {
    Todo: [Task!]!
    InProgress: [Task!]!
    Done: [Task!]!
  }


  type Query {
    getTasks(projectId: ID!): [Task!]!
    getProjectTasksGrouped(projectId: ID!): TaskGroupResult
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task
  }

  type Mutation {
    updateTaskStatus(taskId: ID!, status: String!): Task
    deleteTask(taskId: ID!): Boolean
  }

`;

export default taskTypeDefs;

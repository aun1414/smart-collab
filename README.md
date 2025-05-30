# Smart Collaboration Platform

A modern, AI-powered collaborative project management platform that enables teams to efficiently manage projects, tasks, and documents with intelligent automation features.

## 🌟 Project Overview

This full-stack application combines traditional project management capabilities with cutting-edge AI integration to enhance team productivity. The platform features real-time collaboration tools, intelligent document processing, and automated task generation powered by Google Gemini AI.

**Note on Development Approach:**
- **Backend**: Developed independently to master GraphQL architecture, Redis caching, and modern Node.js practices
- **Frontend**: Integrated using Cursor AI to explore and evaluate AI-assisted development tools

## ✨ Key Features

### 🔐 Authentication & User Management
- JWT-based secure authentication system
- User registration and login with bcrypt password hashing
- Role-based access control for teams and projects

### 👥 Team Collaboration
- Create and manage multiple teams
- Invite team members with owner/member roles
- Team-based project organization

### 📋 Project Management
- Create and organize projects within teams
- Project-specific task management
- Document storage and organization per project

### ✅ Task Management
- Create, assign, and track tasks
- Task status management (todo, in-progress, completed)
- AI-powered task suggestion from document content

### 📄 Intelligent Document Processing
- Multi-format file upload support (PDF, DOCX, TXT)
- AI-powered document summarization using Google Gemini
- Automatic text extraction and processing
- Redis-cached summaries for improved performance

### 🤖 AI Integration
- Google Gemini API for text summarization
- Automated task generation from document analysis
- Smart content processing and insights

### ⚡ Performance Optimization
- Redis caching layer for faster response times
- Efficient GraphQL queries with optimized resolvers
- Automated file cleanup after processing

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **API**: GraphQL with Apollo Server
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for performance optimization
- **Authentication**: JWT with bcryptjs
- **AI Integration**: Google Gemini API
- **File Processing**: Multer, PDF-parse, Mammoth
- **Development**: Nodemon for hot reloading

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) with Tailwind CSS
- **GraphQL Client**: Apollo Client
- **Routing**: React Router DOM
- **Forms**: Formik with Yup validation
- **File Upload**: React Dropzone

## 📁 Project Structure

```
smart-collab/
├── server/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── typeDefs/        # GraphQL type definitions
│   │   ├── resolvers/       # GraphQL resolvers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── utils/           # Database, Redis, file utilities
│   │   ├── ai/              # AI integration modules
│   │   └── index.js         # Server entry point
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Application pages
│   │   ├── graphql/         # GraphQL queries/mutations
│   │   └── utils/           # Client utilities
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Redis server
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smart-collab.git
cd smart-collab
```

2. **Setup Backend**
```bash
cd server
npm install
```

3. **Setup Frontend**
```bash
cd ../client
npm install
```

4. **Environment Configuration**

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

5. **Start Development Servers**

Backend:
```bash
cd server
npm start
```

Frontend:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend GraphQL Playground: `http://localhost:5000/graphql`

## 🔧 API Overview

### GraphQL Endpoints

The application uses a single GraphQL endpoint (`/graphql`) with the following main operations:

**Authentication**
- `register(input: RegisterInput!): AuthPayload!`
- `login(input: LoginInput!): AuthPayload!`

**Teams**
- `createTeam(input: CreateTeamInput!): Team!`
- `getTeams: [Team!]!`
- `addTeamMember(teamId: ID!, userId: ID!): Team!`

**Projects**
- `createProject(input: CreateProjectInput!): Project!`
- `getProjects(teamId: ID!): [Project!]!`

**Tasks**
- `createTask(input: CreateTaskInput!): Task!`
- `updateTaskStatus(id: ID!, status: TaskStatus!): Task!`
- `suggestAndSaveTasks(documentId: ID!): [Task!]!`

**Documents**
- `getDocuments(projectId: ID!): [Document!]!`

**File Upload**
- `POST /upload` - Upload and process documents with AI summarization

## 🎯 Learning Objectives Achieved

### Backend Development (Self-Implemented)
- **GraphQL Mastery**: Implemented complex schema design with nested resolvers
- **Redis Integration**: Learned caching strategies for improved performance
- **MongoDB Optimization**: Designed efficient schemas with proper relationships
- **AI Integration**: Successfully integrated Google Gemini API for text processing
- **Authentication**: Implemented secure JWT-based authentication system

### AI Tool Exploration (Frontend)
- **Cursor AI**: Explored AI-assisted development for rapid frontend prototyping
- **Development Efficiency**: Evaluated AI tools for accelerating UI development
- **Modern React**: Learned latest React 19 features with TypeScript integration

## 🚀 Future Enhancements

- Real-time collaboration with WebSocket integration
- Advanced AI features (meeting transcription, smart scheduling)
- Mobile app development
- Enhanced analytics and reporting
- Integration with popular productivity tools

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

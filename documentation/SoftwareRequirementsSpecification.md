# Software Requirements Specification Document

## System Design

- **Purpose:** Provide a tool for managing Autosys job workflows with visualized job dependencies, performance metrics, and execution timelines.
- **Components:**
  - Interactive, graph-based visualization of job hierarchies.
  - Drill-down navigation and filtering for detailed job metrics.
  - Integrated Gantt chart for job scheduling and timelines.
  - Real-time monitoring and alerting for failed job nodes.

## Architecture Pattern

- **Client-Server Model:**
  - **Frontend:** Single Page Application (SPA) built with React.
  - **Backend:** API-driven services built in Python.
- **Visualization Integration:** Leverages D3.js for graph visualization and a specialized React Gantt chart package.
- **Service Interaction:** RESTful or GraphQL APIs facilitate communication between the front and backend.

## State Management

- **Frontend:**
  - Use Redux (or Context API) for managing global state, including filter settings, graph interactions, and real-time updates.
- **Backend:**
  - Manage session states and token-based authentication using in-memory caching or lightweight state storage.
- **Real-Time Data:** Integration of web sockets for live job status and performance updates if needed.

## Data Flow

- **Initial Data Load:** API calls to fetch job hierarchies, performance metrics, and timeline data when the application starts.
- **User Interaction:**
  - Filter or drill-down actions trigger subsequent API requests.
  - Dynamic updates to the visualization and metrics panels.
- **Synchronization:** Continuous updates between the backend and frontend via RESTful endpoints or websockets for real-time monitoring.

## Technical Stack

- **Frontend:**
  - **Language/Framework:** React with JavaScript/TypeScript.
  - **Other libraries:** Tailwind CSS, Shadcn UI, Lucide Icons, Sonner Toast
  - **Routing:** React Router for client-side navigation.
  - **Visualization:** D3.js for graph visualizations; a React-based Gantt chart library (e.g., react-gantt-chart).
  - **State Management:** Redux or Context API.
- **Backend:**
  - **Language/Framework:** Python, with FastAPI (or Flask) for API development.
  - **Authentication:** Use libraries like FastAPI-JWT-Auth or Flask-JWT-Extended.
  - **Real-Time:** Consider websockets or Socket.IO integration if real-time updates are required.
- **Database:**
  - **Primary:** Neo4J for managing job dependencies and relationships.
  - **Integration:** Utilize the official Neo4J Python driver or py2neo.
- **Additional Tools:**
  - Docker for containerization.
  - Automated testing frameworks (e.g., PyTest for backend, Jest for React).
  - Continuous Integration/Deployment tools.

## Authentication Process

- **User Login:** Secure login via username and password.
- **Token-Based Authentication:** JWT tokens for session management and secure API access.
- **Access Control:** Role-based permissions to manage varying levels of user access.
- **Integration:** Option to integrate with existing enterprise authentication systems.

## Route Design

- **API Endpoints:**
  - Routes for fetching job hierarchies, metrics, and Gantt chart data.
  - Separate routes for user authentication and session management.
- **Query Parameters:** Support for filtering, sorting, and drill-down requests.
- **Error Handling:** Standard HTTP error codes with descriptive error messages for ease of debugging.

## API Design

- **Methods:** Standard HTTP methods (GET, POST, PUT, DELETE) to handle CRUD operations.
- **Endpoints:**
  - **/jobs:** Retrieve job dependency and hierarchy information.
  - **/metrics:** Fetch performance metrics including runtime, wait times, etc.
  - **/timeline:** Provide Gantt chart data for job scheduling.
  - **/auth:** Manage authentication, token issuance, and user sessions.
- **Documentation:** Auto-generated API docs using OpenAPI or similar tools.

## Database Design ERD

- **Entities:**
  - **Job:** Attributes include job ID, name, status, runtime metrics.
  - **Dependency:** Represents relationships between parent and child jobs.
  - **PerformanceMetric:** Contains metrics such as maximum wait time and actual runtime.
  - **User:** Stores authentication credentials and roles.
- **Relationships:**
  - One-to-many between Job and Dependency.
  - One-to-one or many-to-one between Job and PerformanceMetric.
  - User roles tied to job access permissions.
- **Neo4J Considerations:** Utilize graph relationships to efficiently query complex job dependencies and impact propagation.

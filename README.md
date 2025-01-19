# Hospital Management System

This is a full-stack web application for managing various aspects of a hospital, including patient records, staff assignments, scheduling, billing, and diagnostics. It consists of a Spring Boot backend and a React frontend.

## Features

**Patient Management:**

* Add, view, update, and delete patient records.
* Search and filter patient data.
* View detailed patient information, including admissions, appointments, assessments, billing, care plans, prescriptions, vital signs, product usage, medication administrations, image reports, and lab results.

**Staff Management:**

* Manage user accounts (add, update, delete, search).
* Assign nurses to patients, units, and rooms.
* View nurse activities.

**Scheduling:**

* Automated scheduling of vital sign recordings based on unit type.
* View and manage patient schedules.

**Billing:**

* Generate and manage patient bills.
* Calculate billing totals, including costs for procedures, product usage, lab tests, and image reports.
* Generate HTML bills for viewing and printing.

**Diagnostics:**

* Manage lab tests and results (using dynamic table generation).
* Upload, view, and manage image reports.
* Define image report types and their associated costs.

**Other Features:**

* Secure authentication and authorization using JWT.
* Role-based access control to different functionalities.
* Assessment templates and PDF export.
* Product usage tracking and billing.
* Medication management and administration.

## Technologies Used

**Backend:**

* Java 17
* Spring Boot
* Spring Security
* Spring Data JPA
* PostgreSQL
* Lombok
* Mapstruct
* JWT (JJWT)
* Jackson Databind

**Frontend:**

* React
* Vite
* Ant Design
* Material UI
* Axios
* CKEditor 5
* HTML2PDF.js
* React Player
* Zustand
* React Router


## Building and Running with Docker

This project uses Docker for simplified building and deployment.  Follow these steps:

1. **Configure for Production:**
   - In the `backend/src/main/resources/application.properties` file, uncomment the production configuration section and comment out the development configuration.  This will configure the application to connect to the PostgreSQL database running in the Docker container.  Your production configuration should look like this:

   ```properties
   spring.application.name=website
   spring.datasource.url=jdbc:postgresql://database:5432/mydb
   spring.datasource.username=bassel
   spring.datasource.password=fl studio
   spring.datasource.driver-class-name=org.postgresql.Driver

   # JPA Configuration
   spring.jpa.hibernate.ddl-auto=update
   # ... (rest of the production configuration)
   ```

2. **Build and Run with Docker Compose:**
   - Navigate to the root directory of the project.
   - Run the following command:

   ```bash
   docker-compose up --build
   ```

   This will build the backend and frontend Docker images and start the containers, including the PostgreSQL database.

3. **Access the Application:**
    - The backend will be accessible at `http://localhost:8080`.
    - The frontend will be accessible at `http://localhost:3000`.



## Frontend Development Server

To run the frontend development server without Docker:

1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.


## Backend Development Server

To run the backend development server without Docker:
1. Make sure postgress database is set up on your local machine running at localhost:5432
2. Set `spring.datasource.url=jdbc:postgresql://localhost:5432/mydb`  in the `backend/src/main/resources/application.properties` file.
3. Open the project in your ide.
4. Run the project.




## Folder Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── ... (backend source code)
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── ... (backend tests)
└── pom.xml

frontend/
├── src/
│   └── ... (frontend source code)
├── package.json
└── ... (other frontend files)

docker-compose.yml

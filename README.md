<img width="800" height="500" alt="Untitled design (3)" src="https://github.com/user-attachments/assets/e01a5d23-9e61-4f62-aae9-8b285dfe894c" />


# JCare

Full-stack hospital management system covering patient records, staff assignments, automated scheduling, billing, and diagnostics. Started as a basic patient tracker, turned into a full-blown clinical workflow and billing engine. It happens.

## Stack

- **Backend:** Java 17, Spring Boot, Spring Data JPA, Spring Security.
- **DB:** PostgreSQL.
- **Frontend:** React (Vite), Zustand (state), React Router.
- **UI:** Ant Design *and* Material UI (yes, both. Don't ask).
- **Other:** JWT (JJWT), Lombok, Mapstruct, CKEditor 5, HTML2PDF.js, React Player.

## What's in here

**Patient & Clinical Core**
- Admissions, appointments, and care plans.
- Vital signs tracking, assessments (with PDF export), and prescriptions.
- Medication management and administration logs.
- Product usage tracking.

**Staff & Resourcing**
- User accounts and role-based access control (RBAC).
- Assigning nurses to patients, units, and rooms.
- Nurse activity tracking.

**Diagnostics**
- Lab tests and results (utilizing dynamic table generation).
- Image report uploads and management.
- Configurable image report types and associated costs.

**Billing & Finance**
- Patient bill generation.
- Automated cost aggregation across procedures, product usage, lab tests, and imaging.
- HTML bills ready for viewing and printing.

**Scheduling & Auth**
- Automated scheduling for vital sign recordings based on unit type.
- Secure JWT-based authentication.

## Getting started

You can spin the whole thing up via Docker, or run it locally for development.

### The Docker Route

1. Open `backend/src/main/resources/application.properties`.
2. Manually uncomment the Docker database URL (`database:5432`) and comment out the local one. 
3. Run the build:
```bash
docker-compose up --build
```
Backend will be on `http://localhost:8080`, frontend on `http://localhost:3000`.

### Local Development

If you want hot-reloading and IDE support:

1. Make sure Postgres is running locally on `:5432`.
2. Open `backend/src/main/resources/application.properties` and set the URL back to `jdbc:postgresql://localhost:5432/mydb`.
3. Fire up the backend via your Java IDE.
4. Fire up the frontend:
```bash
cd frontend
npm install
npm run dev
```

## Known rough edges

Being upfront:

- **Manual config swapping.** Having to manually comment/uncomment `application.properties` to switch between Docker and local dev is annoying.

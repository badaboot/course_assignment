# Course assignment system

Video demo: https://youtu.be/-LrsfXI3RAc

Screenshots:
<img width="1822" height="1095" alt="Screenshot 2026-06-12 at 8 23 34 AM" src="https://github.com/user-attachments/assets/604bf992-1175-47a0-9c52-8c39ee957e84" />
<img width="1822" height="1095" alt="Screenshot 2026-06-12 at 8 23 37 AM" src="https://github.com/user-attachments/assets/3caff2b1-bc31-4a70-8e99-5175af7ed220" />
<img width="1822" height="1095" alt="Screenshot 2026-06-12 at 8 24 38 AM" src="https://github.com/user-attachments/assets/8d67a553-60a6-4a40-9b3d-b4dfa50e5baf" />


## Getting started

```bash
npm install
npm run dev
```

This starts both the **API server** and the **Vite dev server (frontend)** concurrently.

### URLs

| What          | URL                            | Notes                                                                               |
| ------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| UI (with HMR) | http://localhost:5173/students | Use this for development — Vite hot-reloads on file save                            |
| API server    | http://localhost:3001          | Express backend serving `/api/students`, `/api/students/:id`, `/api/course-catalog` |

> **Note:** `http://localhost:3001` serves the **production build** of the client (from `client/dist`).

The Vite dev server proxies `/api` requests to the Express server.

Use `http://localhost:5173/students` during development to get hot module reload.

### UI Endpoints

| Route             | Page          | Description                                                                                                                                     |
| ----------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `/students`       | StudentList   | Lists all students with links to their detail page                                                                                              |
| `/students/:id`   | StudentDetail | Shows student info, a table of course requests, and Approve/Deny actions; includes a search-and-add widget to attach new course recommendations |
| `/course-catalog` | CourseCatalog | Lists all courses in a table; supports adding and removing courses                                                                              |

### API Endpoints

| Method | Path                                        | Description                                                                                                                |
| ------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/students`                             | Returns all students                                                                                                       |
| GET    | `/api/students/:id`                         | Returns a single student by ID; 404 if not found                                                                           |
| GET    | `/api/course-catalog`                       | Returns all courses                                                                                                        |
| POST   | `/api/course-catalog`                       | Adds a new course to the catalog                                                                                           |
| DELETE | `/api/course-catalog/:code`                 | Removes a course by code                                                                                                   |
| GET    | `/api/students/:student_id/course-requests` | Returns course recommendations for a student; optional `?approval_status=` and `?request_type=` query params               |
| POST   | `/api/course-requests`                      | Creates a new course request with an auto-generated ID                                                                     |
| PATCH  | `/api/course-requests/:id`                  | Creates a new course request as a copy of an existing one with updated fields (Approve/Deny action), similar to audit logs |

### Tradeoffs

- API has no versioning since this is a prototype. It would be versioned in production
- frontend and backend use the same langauge in prototype. Backend is kept intentionally lean to be migrated to python in production
- data is stored in `.json` files in `server/data` folder. CRUD operations via API change the file directly for this prototype. In production API endpoints will call real data
- UI is minimal without styling or animations. Those will be added on once data model is more determined, or more UI direction provided (which libraries to use/design system)

### Features considered

- on **student detail** and **course catalog** page can show charts for denied/approved/pending, and department breakdown of courses
- on **student detail** page ideally the teacher can copy from another student or upload by csv to save manual toil. Need verify with end user/PM that this is actually value-add
- on **student list** page can show chart: student breakdown by grade

### Assumptions

- the `courseRecommendations.json` is generated by Gemini. These connect students to courses would be generated in a batch process with a request like:

Endpoint: `POST /api/course-requests`

Payload: ```json
{
"student_id": "S003",
"course_code": "MTH101",
"request_type": "primary",
"source": "system",
"system_rationale": "Failed course in prior term; trigger mandatory retake."
}

```

Behavior: The database creates the row, generates a unique UUID/ID (REQ_001), defaults approval_status to "pending_review", and nullifies human tracking variables.
```

### Written Extensions (answers from PDF)

- on co-requisites and how to surface it in the UI:

Can add it in `courses.json`

```
[
  {
    "course_code": "ENG101",
    "course_name": "English 9",
    "department": "English",
    "target_grade_range": ["9"],
    "is_repeatable": false,
    "corequisites": []
  },
  {
    "course_code": "ENG102",
    "course_name": "English 9 ELL Support",
    "department": "English",
    "target_grade_range": ["9"],
    "is_repeatable": false,
    "corequisites": ["ENG101"]
  }
]
```

and surface the course codes in UI in the **course request** table as a separate column with a button to add requisite courses. Can also show a warning if only one course is approved and the required courses are not yet approved.

- integration with external scheduling platform: I'd need to learn more about the requirements. Would this be a one-click download csv download or an API? would there be different scopes of users (eg. admin export vs student export), and how to split data into different reports/endpoints if that's required. We'd need to be able to revoke permissions for this account for security reasons

- changing student population and how to get the counselor to notice: counselor can have a `/needs-work` page which shows `active` students that don't have any assignments yet, eg. no rows in the courses-students jumbo table (currently `courseRecommendations.json`). On student leaving there can be an automation (API) to remove them from all of their courses to free up room for other students and change their status to `deactivated`

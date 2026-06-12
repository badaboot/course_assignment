# Course Assignment

## Running the App

```bash
npm run dev
```

This starts both the **API server** and the **Vite dev server** concurrently.

### URLs

| What          | URL                   | Notes                                                                               |
| ------------- | --------------------- | ----------------------------------------------------------------------------------- |
| UI (with HMR) | http://localhost:5173 | Use this for development — Vite hot-reloads on file save                            |
| API server    | http://localhost:3001 | Express backend serving `/api/students`, `/api/students/:id`, `/api/course-catalog` |

> **Note:** `http://localhost:3001` serves the **production build** of the client (from `client/dist`).

To get HMR use `localhost:5173` during development. The Vite dev server proxies `/api` requests to the Express server.

### Assumptions

- there are duplications in required courses for grade 11 and grade 12, given seed data which shows some grade 11 take grade 12 courses

import { Routes, Route, Link } from "react-router-dom";
import StudentList from "./pages/StudentList";
import StudentDetail from "./pages/StudentDetail";
import CourseCatalog from "./pages/CourseCatalog";

export default function App() {
  return (
    <div>
      <nav>
        <ul
          style={{
            display: "flex",
            gap: "12px",
            listStyle: "none",
            padding: 0,
          }}
        >
          <li>
            <Link to="/students">Students</Link>
          </li>
          <li>
            <Link to="/course-catalog">Course Catalog</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Routes>
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/course-catalog" element={<CourseCatalog />} />
      </Routes>
    </div>
  );
}

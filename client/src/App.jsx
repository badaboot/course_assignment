import { Routes, Route, Link } from 'react-router-dom';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import CourseCatalog from './pages/CourseCatalog';

export default function App() {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/students">Students</Link></li>
          <li><Link to="/course-catalog">Course Catalog</Link></li>
        </ul>
      </nav>
      <hr />
      <Routes>
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/course-catalog" element={<CourseCatalog />} />
      </Routes>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("/api/course-catalog")
      .then((res) => res.json())
      .then(setCourses);
  }, []);

  return (
    <div>
      <h1>Course Catalog</h1>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Course Name</th>
            <th>Department</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.code}>
              <td>{c.code}</td>
              <td>{c.course_name}</td>
              <td>{c.department}</td>
              <td>{c.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

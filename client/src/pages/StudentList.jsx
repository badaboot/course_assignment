import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [electiveCourses, setElectiveCourses] = useState(null);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then(setStudents);
  }, []);

  return (
    <div>
      <h1>Students</h1>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Grade</th>
            <th>Profile</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>
                <Link to={`/students/${s.id}`}>{s.name}</Link>
              </td>
              <td>{s.grade}</td>
              <td>{s.profile}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched student data:", data);
        setStudent(data);
      });
  }, [id]);

  if (!student) return <p>Loading...</p>;

  return (
    <div>
      <h1>{student.name}</h1>
      <p>
        <strong>ID:</strong> {student.id}
      </p>
      <p>
        <strong>Grade:</strong> {student.grade}
      </p>
      <p>
        <strong>Profile:</strong> {student.profile}
      </p>
      <p>
        <strong>Suggested Requests:</strong>
      </p>
      <ul>
        {student.suggested_requests &&
          student.suggested_requests.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
      <Link to="/students">Back to students</Link>
    </div>
  );
}

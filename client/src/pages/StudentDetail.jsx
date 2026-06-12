import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [requiredCourses, setRequiredCourses] = useState(null);
  const [electiveCourses, setElectiveCourses] = useState(null);

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setStudent(data);
      });
  }, [id]);

  useEffect(() => {
    fetch("/api/suggested-courses")
      .then((res) => res.json())
      .then((data) => setRequiredCourses(data));
  }, []);

  useEffect(() => {
    fetch("/api/elective-courses")
      .then((res) => res.json())
      .then((data) => setElectiveCourses(data));
  }, []);

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
      <p>
        <strong>Required Courses (Grade {student.grade}):</strong>
      </p>
      <ul>
        {requiredCourses && requiredCourses[String(student.grade)] ? (
          requiredCourses[String(student.grade)].map((c, i) => (
            <li key={i}>{c}</li>
          ))
        ) : (
          <li>None</li>
        )}
      </ul>
      <p>
        <strong>Elective Courses (Grade {student.grade}):</strong>
      </p>
      <ul>
        {electiveCourses && electiveCourses[String(student.grade)] ? (
          electiveCourses[String(student.grade)].map((c, i) => (
            <li key={i}>{c}</li>
          ))
        ) : (
          <li>None</li>
        )}
      </ul>
      <Link to="/students">Back to students</Link>
    </div>
  );
}

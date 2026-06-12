import { useEffect, useState } from "react";

const emptyForm = { code: "", course_name: "", department: "", grade: "" };

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/course-catalog")
      .then((res) => res.json())
      .then(setCourses);
  }, []);

  const departments = [...new Set(courses.map((c) => c.department))].sort();
  const grades = [...new Set(courses.map((c) => c.grade))].sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });

  function handleSubmit(e) {
    e.preventDefault();
    fetch("/api/course-catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((created) => {
        setCourses((prev) => [...prev, created]);
        setForm(emptyForm);
        setShowForm(false);
      });
  }

  return (
    <div>
      <h1>Course Catalog</h1>
      <button
        style={{ marginBottom: "20px" }}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "Add course"}
      </button>

      {showForm && (
        <>
          <h2>Add course</h2>
          <form onSubmit={handleSubmit} style={{ margin: "12px 0" }}>
            <div>
              <label>
                Code:{" "}
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label>
                Course Name:{" "}
                <input
                  required
                  value={form.course_name}
                  onChange={(e) =>
                    setForm({ ...form, course_name: e.target.value })
                  }
                />
              </label>
            </div>
            <div>
              <label>
                Department:{" "}
                <select
                  required
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                >
                  <option value="">-- Select --</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                Grade:{" "}
                <select
                  required
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                >
                  <option value="">-- Select --</option>
                  {grades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" style={{ marginTop: 8 }}>
              Save
            </button>
          </form>
        </>
      )}

      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Course Name</th>
            <th>Department</th>
            <th>Grade</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.code}>
              <td>{c.code}</td>
              <td>{c.course_name}</td>
              <td>{c.department}</td>
              <td>{c.grade}</td>
              <td>
                <button
                  onClick={() => {
                    if (confirm(`Remove course ${c.code}?`)) {
                      fetch(`/api/course-catalog/${c.code}`, {
                        method: "DELETE",
                      })
                        .then((res) => res.json())
                        .then(() =>
                          setCourses((prev) =>
                            prev.filter((x) => x.code !== c.code),
                          ),
                        );
                    }
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

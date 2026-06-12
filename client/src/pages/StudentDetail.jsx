import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const notesOptions = [
  {
    label: "Core Retake (Prior Failure)",
    db_notes_text: "Failed course in prior term; trigger mandatory retake.",
    auto_flags: { is_retake: true, request_type: "primary" },
  },
  {
    label: "Grade Improvement Attempt",
    db_notes_text:
      "Retaking course to improve original passing grade baseline.",
    auto_flags: { is_retake: true, request_type: "elective" },
  },
  {
    label: "Standard Acceleration Pathway",
    db_notes_text: "Advanced placement based on track optimization metrics.",
    auto_flags: { is_retake: false, request_type: "primary" },
  },
];

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [courseRequests, setCourseRequests] = useState(null);
  const [courseCatalog, setCourseCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedNote, setSelectedNote] = useState(notesOptions[2]);
  const [requestType, setRequestType] = useState("primary");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [error, setError] = useState(null);

  function statusLabel(status) {
    if (status === "approved") return "✅ " + status;
    if (status === "denied") return "❌ " + status;
    return status;
  }

  function requestTypeColor(type) {
    if (type === "primary") return "pink";
    if (type === "elective") return "lightblue";
    if (type === "alternate") return "#ffbf00";
    return "transparent";
  }

  function courseName(code) {
    const c = courseCatalog.find((c) => c.code === code);
    return c ? c.course_name : code;
  }

  useEffect(() => {
    fetch("/api/course-catalog")
      .then((res) => res.json())
      .then((data) => setCourseCatalog(data));
  }, []);

  const existingCodes = new Set(
    (courseRequests || []).map((r) => r.course_code),
  );
  const filteredCourses = searchQuery
    ? courseCatalog.filter(
        (c) =>
          !existingCodes.has(c.code) &&
          c.code.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];
  // TODO: move add course component to separate file for easier testing
  function addCourseRequest() {
    if (!selectedCourse) return;
    const payload = {
      student_id: student.id,
      course_code: selectedCourse.code,
      request_type: requestType,
      is_required_for_grad: selectedCourse.is_required,
      is_retake: selectedNote.auto_flags.is_retake,
      source: "counselor",
      system_rationale:
        "Manually searched and added via student details dashboard view.",
      approval_status: "approved",
      reviewed_by: "USR_COUNSELOR_04",
      reviewed_at: new Date().toISOString(),
      notes: selectedNote.db_notes_text,
    };
    fetch("/api/course-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((created) => {
        setCourseRequests((prev) => [...(prev || []), created]);
        setSelectedCourse(null);
        setSearchQuery("");
        setRequestType("primary");
        setSelectedNote(notesOptions[2]);
        setShowAddCourse(false);
      });
  }

  function updateRequestStatus(requestId, approvalStatus) {
    const payload = {
      approval_status: approvalStatus,
      reviewed_by: "USR_COUNSELOR_04",
      reviewed_at: new Date().toISOString(),
    };
    fetch(`/api/course-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((updated) => {
        setCourseRequests((prev) => [...(prev || []), updated]);
      });
  }

  useEffect(() => {
    setError(null);
    fetch(`/api/students/${id}`).then((res) => {
      if (!res.ok) return res.json().then((data) => setError(data.error));
      return res.json().then((data) => setStudent(data));
    });
  }, [id]);

  useEffect(() => {
    fetch(`/api/students/${id}/course-requests`)
      .then((res) => res.json())
      .then((data) => setCourseRequests(data));
  }, [id]);
  const latestCourses = courseRequests
    ? Object.values(
        courseRequests.reduce((acc, r) => {
          if (
            !acc[r.course_code] ||
            Number(r.id) > Number(acc[r.course_code].id)
          )
            acc[r.course_code] = r;
          return acc;
        }, {}),
      ).sort((a, b) => Number(b.id) - Number(a.id))
    : [];

  if (error) return <p>Error: {error}</p>;
  if (!student) return <p>Loading...</p>;

  return (
    <div>
      <h1>Student: {student.name}</h1>
      <p>
        <strong>ID:</strong> {student.id}
      </p>
      <p>
        <strong>Grade:</strong> {student.grade}
      </p>
      <p>
        <strong>Profile:</strong> {student.profile}
      </p>

      {!showAddCourse && (
        <button
          onClick={() => setShowAddCourse(true)}
          style={{ margin: "12px 0" }}
        >
          Add course
        </button>
      )}
      {showAddCourse && (
        <div style={{ margin: "12px 0" }}>
          <h2>Add course</h2>
          <input
            type="text"
            placeholder="Search course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && filteredCourses.length > 0 && (
            <select
              size={Math.min(filteredCourses.length, 5)}
              style={{ display: "block", marginTop: 4 }}
              onChange={(e) => {
                const course = courseCatalog.find(
                  (c) => c.code === e.target.value,
                );
                setSelectedCourse(course);
                setSearchQuery(course.code);
              }}
            >
              {filteredCourses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.course_name}
                </option>
              ))}
            </select>
          )}
          {showAddCourse && (
            <div style={{ marginTop: 8 }}>
              <label>
                Request type:{" "}
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                >
                  <option value="primary">primary</option>
                  <option value="elective">elective</option>
                  <option value="alternate">alternate</option>
                </select>
              </label>
              <label style={{ marginLeft: 8 }}>
                Note:{" "}
                <select
                  value={notesOptions.indexOf(selectedNote)}
                  onChange={(e) =>
                    setSelectedNote(notesOptions[Number(e.target.value)])
                  }
                  style={{ marginLeft: 4 }}
                >
                  {notesOptions.map((opt, i) => (
                    <option key={i} value={i}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={addCourseRequest}
                style={{ marginLeft: 8 }}
                disabled={!selectedCourse}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}
      <h2>Course Requests</h2>
      <h3>
        Approved:{" "}
        {latestCourses.filter((c) => c.approval_status === "approved").length},
        Denied:{" "}
        {latestCourses.filter((c) => c.approval_status === "denied").length},
        Pending:{" "}
        {
          latestCourses.filter((c) => c.approval_status === "pending_review")
            .length
        }
      </h3>
      <table
        border={1}
        cellPadding={6}
        style={{ borderCollapse: "collapse", marginTop: 12 }}
      >
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Request Type</th>
            <th>Approval Status</th>
            <th>System Rationale</th>
            <th>Source</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {latestCourses.map((r) => (
            <tr key={r.id}>
              <td>{r.course_code}</td>
              <td>{courseName(r.course_code)}</td>
              <td style={{ background: requestTypeColor(r.request_type) }}>
                {r.request_type}
              </td>
              <td>{statusLabel(r.approval_status)}</td>
              <td>{r.system_rationale}</td>
              <td>{r.source}</td>
              <td>
                {r.approval_status === "pending_review" && (
                  <>
                    <button
                      className="btn-approve"
                      style={{ marginRight: "12px" }}
                      onClick={() => updateRequestStatus(r.id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-red"
                      onClick={() => updateRequestStatus(r.id, "denied")}
                    >
                      Deny
                    </button>
                  </>
                )}
                {r.approval_status === "approved" && (
                  <button
                    className="btn-red"
                    onClick={() => updateRequestStatus(r.id, "denied")}
                  >
                    Deny
                  </button>
                )}
                {r.approval_status === "denied" && (
                  <button
                    className="btn-approve"
                    onClick={() => updateRequestStatus(r.id, "approved")}
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Historical changes</h2>
      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Request Type</th>
            <th>Approval Status</th>
            <th>Reviewed By</th>
            <th>Reviewed At</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {[...(courseRequests || [])]
            .sort((a, b) => Number(b.id) - Number(a.id))
            .map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.course_code}</td>
                <td>{courseName(r.course_code)}</td>
                <td style={{ background: requestTypeColor(r.request_type) }}>
                  {r.request_type}
                </td>
                <td>{statusLabel(r.approval_status)}</td>
                <td>{r.reviewed_by || "—"}</td>
                <td>
                  {r.reviewed_at
                    ? `${new Date(r.reviewed_at).toLocaleString()} ${new Date(r.reviewed_at).toLocaleTimeString(undefined, { timeZoneName: "short" }).split(" ").pop()}`
                    : "—"}
                </td>
                <td>{r.notes || "—"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

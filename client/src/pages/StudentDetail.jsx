import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [requiredCourses, setRequiredCourses] = useState(null);
  const [courseCatalog, setCourseCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [requestType, setRequestType] = useState("primary");
  const [showAddCourse, setShowAddCourse] = useState(false);

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

  useEffect(() => {
    fetch("/api/course-catalog")
      .then((res) => res.json())
      .then((data) => setCourseCatalog(data));
  }, []);

  const filteredCourses = searchQuery
    ? courseCatalog.filter((c) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  function addCourseRequest() {
    if (!selectedCourse) return;
    const payload = {
      student_id: student.id,
      course_code: selectedCourse.code,
      request_type: requestType,
      is_required_for_grad: selectedCourse.is_required,
      source: "counselor",
      system_rationale:
        "Manually searched and added via student details dashboard view.",
      approval_status: "approved",
      reviewed_by: "USR_COUNSELOR_04",
      reviewed_at: new Date().toISOString(),
      notes: "Direct UI injection via search-and-add interaction.",
    };
    fetch("/api/course-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((created) => {
        setRequiredCourses((prev) => [...(prev || []), created]);
        setSelectedCourse(null);
        setSearchQuery("");
        setRequestType("primary");
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
        setRequiredCourses((prev) => [...(prev || []), updated]);
      });
  }

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setStudent(data);
      });
  }, [id]);

  useEffect(() => {
    fetch(`/api/students/${id}/course-requests`)
      .then((res) => res.json())
      .then((data) => setRequiredCourses(data));
  }, [id]);
  const latestCourses = requiredCourses
    ? Object.values(
        requiredCourses.reduce((acc, r) => {
          if (
            !acc[r.course_code] ||
            Number(r.id) > Number(acc[r.course_code].id)
          )
            acc[r.course_code] = r;
          return acc;
        }, {}),
      )
    : [];

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
          {selectedCourse && (
            <div style={{ marginTop: 8 }}>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
              >
                <option value="primary">primary</option>
                <option value="elective">elective</option>
                <option value="alternate">alternate</option>
              </select>
              <button onClick={addCourseRequest} style={{ marginLeft: 8 }}>
                Save
              </button>
            </div>
          )}
        </div>
      )}
      <h2>Course Requests</h2>
      <table
        border={1}
        cellPadding={6}
        style={{ borderCollapse: "collapse", marginTop: 12 }}
      >
        <thead>
          <tr>
            <th>Course Code</th>
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
      <h2>Student's course events, ordered by most recent</h2>
      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Course Code</th>
            <th>Request Type</th>
            <th>Approval Status</th>
            <th>Reviewed By</th>
            <th>Reviewed At</th>
          </tr>
        </thead>
        <tbody>
          {[...(requiredCourses || [])]
            .sort((a, b) => Number(b.id) - Number(a.id))
            .map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.course_code}</td>
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
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

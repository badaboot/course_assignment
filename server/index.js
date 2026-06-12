import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

const students = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'students.json'), 'utf-8'));

app.use(express.json());

app.get('/api/students', (req, res) => {
  res.json(students);
});

app.get('/api/students/:id', (req, res) => {
  const student = students.find(s => s.id === req.params.id);
  console.log(`Fetching student with ID: ${req.params.id}, found ${student}`);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

const coursesFilePath = path.join(__dirname, 'data', 'courses.json');

app.get('/api/course-catalog', (req, res) => {
  const courses = JSON.parse(fs.readFileSync(coursesFilePath, 'utf-8'));
  res.json(courses);
});

app.post('/api/course-catalog', (req, res) => {
  const courses = JSON.parse(fs.readFileSync(coursesFilePath, 'utf-8'));
  const newCourse = { ...req.body };
  courses.push(newCourse);
  fs.writeFileSync(coursesFilePath, JSON.stringify(courses, null, 2));
  res.status(201).json(newCourse);
});

app.delete('/api/course-catalog/:code', (req, res) => {
  const courses = JSON.parse(fs.readFileSync(coursesFilePath, 'utf-8'));
  const idx = courses.findIndex((c) => c.code === req.params.code);
  if (idx === -1) return res.status(404).json({ error: "Course not found" });
  const removed = courses.splice(idx, 1)[0];
  fs.writeFileSync(coursesFilePath, JSON.stringify(courses, null, 2));
  res.json(removed);
});

app.get('/api/students/:student_id/course-requests', (req, res) => {
  const recommendations = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'courseRecommendations.json'), 'utf-8'));
  const { student_id } = req.params;
  const { approval_status, request_type } = req.query;

  let results = recommendations.filter(r => r.student_id === student_id);

  if (approval_status) {
    results = results.filter(r => r.approval_status === approval_status);
  }
  if (request_type) {
    results = results.filter(r => r.request_type === request_type);
  }

  res.json(results);
});

app.patch('/api/course-requests/:id', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'courseRecommendations.json');
  const recommendations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const idx = recommendations.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course request not found' });

  recommendations[idx] = { ...recommendations[idx], ...req.body };
  fs.writeFileSync(filePath, JSON.stringify(recommendations, null, 2));
  res.json(recommendations[idx]);
});

app.post('/api/course-requests', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'courseRecommendations.json');
  const recommendations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const lastId = recommendations.reduce((max, r) => {
    const num = parseInt(r.id.replace('REQ_', ''), 10);
    return num > max ? num : max;
  }, 0);
  const newRecord = {
    id: `REQ_${String(lastId + 1).padStart(3, '0')}`,
    ...req.body,
  };
  recommendations.push(newRecord);
  fs.writeFileSync(filePath, JSON.stringify(recommendations, null, 2));
  res.status(201).json(newRecord);
});

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

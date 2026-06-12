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

app.get('/api/course-catalog', (req, res) => {
  const courses = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'courses.json'), 'utf-8'));
  res.json(courses);
});

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

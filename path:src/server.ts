import express from 'express';

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Example endpoint
app.get('/api/example', (req, res) => {
  res.json({ message: 'This is an example endpoint' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
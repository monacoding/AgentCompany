import request from 'supertest';
import express from 'express';

const app = express();
app.get('/', (req, res) => res.send('Hello World!'));
app.get('/api/example', (req, res) => res.json({ message: 'This is an example endpoint' }));

describe('GET /api/example', () => {
  it('responds with json', async () => {
    const response = await request(app).get('/api/example');
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('This is an example endpoint');
  });
});
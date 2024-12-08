import express from 'express';
import { config } from 'dotenv';
import {  OpenAI } from 'openai';

// Load environment variables
config();

// Create a web servera
const app = express();
const port = process.env.PORT || 3034;

app.use(express.json());
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// Initialize OpenAI API

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,

});

// Define a route to handle questions
app.post('/chat', async (req, res) => {

  const {character,Message} = req.body;
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: `Give me a response for the following chat message as ${character} from Harry Potter Series. Message: ${Message}` }],
  });

  res.send(completion.choices[0].message.content);
});
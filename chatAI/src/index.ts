import express from 'express';
import { config } from 'dotenv';
import { OpenAI } from 'openai';
import cors from 'cors';
import * as PlayHT from 'playht';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

PlayHT.init({
  userId: process.env.PLAYHT_USER_ID || '',
  apiKey: process.env.PLAYHT_API_KEY || '',
});

// 1⃣ Resolve the absolute path to the static folder
const staticFolderPath = path.join(__dirname, 'static');

// 2⃣ Ensure the static folder exists, if not, create it
if (!fs.existsSync(staticFolderPath)) {
  fs.mkdirSync(staticFolderPath, { recursive: true }); // Create 'static' folder if it doesn't exist
}

// Create a web server
const app = express();
const port = process.env.PORT || 3034;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GPTChat = {
  role: string,
  content: string
}; 

const sessions: Map<string, Array<GPTChat>> = new Map();

// Define a route to handle questions
app.post('/chat', async (req, res) => {
  const { sessionId, character, Message, audio } = req.body;

  try {
    const sessionMessages = sessions.get(sessionId) || [];
    // console.log('Session Messages::', sessionMessages);
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        ...sessionMessages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content
        })),
        { 
          role: 'user', 
          content: `Give me a response for the following chat message as ${character} from Harry Potter Series. The message response should be based on context derived from previous messages.
            Message: ${Message}. 
            The output should be in the following output format. If there is no action then return the action as empty string. 
            Return it as a JSON String. The Action should only show the action / expression whatever he says must be in Response field. If he does not say anything, then that gesture should only be in action not in Response. Action and Response key's capitalization should not be changed. If action contains words like 'says' or 'asks', then whatever comes after that... that is whatever he said or asked should be considered as a response value and not action.
            Example: 
            Message: Professor I am having trouble sleeping.
            Action: ${character} nods thoughtfully. 
            Response: I understand. Let me help you with that.`
        }
      ],
    });

    const content = completion.choices[0].message.content;
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    if (content !== null) {
      const parsedContent = JSON.parse(content);
      console.log(parsedContent);
      const responseText = parsedContent['Response'];
      const speakText = parsedContent['SpeakText'];
      const sessionMessages = sessions.get(sessionId);
      if (sessionMessages) {
        sessionMessages.push({
          role: 'user', 
          content: Message
        });
        sessionMessages.push({
          role: 'assistant',
          content: content
        });
      }
      // 1⃣ Generate audio file for the speak text
      if (responseText) {
        const audioFilePath = await generateAudio(responseText,audio);
        // 2⃣ Read the file and convert it to base64
        fs.readFile(audioFilePath as string, (err, data) => {
          if (err) {
            console.error('❌ Failed to read the audio file:', err);
            return res.status(500).json({ error: 'Failed to read the audio file' });
          }
          
          const base64Audio = data.toString('base64');
          res.send({ Audio: base64Audio, ...parsedContent });
        });
        // Delete the file after sending the response
        res.on('finish', () => {
          fs.unlink(audioFilePath as string, (unlinkErr) => {
            if (unlinkErr) {
              console.error('❌ Failed to delete the audio file:', unlinkErr);
            } else {
              console.log('✅ Audio file deleted successfully');
            }
          });
        });
      } else {
        res.send(parsedContent);
      }
    } else {
      res.status(500).send('Unexpected response format from OpenAI');
    }
    
  } catch (error) {
    console.error('❌ Error in /chat route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function generateAudio(text: string,audio:string) {  
  return new Promise((resolve, reject) => {
    // 1⃣ Create a unique file path for the output audio
    const fileName = `output_${Date.now()}.mp3`; // Create a unique file name
    const filePath = path.join(staticFolderPath, fileName);

    // 2⃣ Create a writable stream for the output file
    const writeStream = fs.createWriteStream(filePath);

    PlayHT.stream(text, { 
      voiceEngine: 'PlayHT2.0-turbo', 
      voiceId: audio
    })
    .then((stream) => {
      stream.pipe(writeStream);
      
      stream.on('end', () => {
        console.log(`✅ Audio file successfully saved at: ${filePath}`);
        resolve(filePath); // Resolve with the file path
      });

      stream.on('error', (error) => {
        console.error('❌ Error while streaming audio:', error);
        reject(error);
      });
    })
    .catch((error) => {
      console.error('❌ Error initializing PlayHT stream:', error);
      reject(error);
    });
  });
}

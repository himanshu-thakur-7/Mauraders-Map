import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Readable } from 'node:stream';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,

});



export async function streamGptText(character:string,Message:string) {
  if (!openai) {
    throw 'OpenAI API not initialised';
  }

  const startTime = Date.now();
  let firstByteReceivedTime:number;

  async function* createStream() {
  const chatGptResponseStream = await openai.chat.completions.create({
    stream:true,
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: `Give me a response for the following chat message as ${character} from Harry Potter Series. Message: ${Message}. The output should be In the following output format. If there is no action then return the action as empty string. Return it as a JSON String. The Action should only show the action / expression whatever he says must be in Response field. Action and Response key's capitalization should not be changed.
      Example: 
      Message: Professor I am having trouble sleeping.
      Action: ${character} nods thoughtfully. 
      Resposne: I understand. Let me help you with that..` }],
  });

  let responseStarted = false;
    for await (const part of chatGptResponseStream) {
       
      if (!firstByteReceivedTime) {
        firstByteReceivedTime = Date.now();
      }
      yield part.choices[0]?.delta?.content || '';
    }
  }

  const stream = Readable.from(createStream());

  return {
    stream,
    getChatGptTTFB: () => firstByteReceivedTime ? firstByteReceivedTime - startTime : null
  };
}
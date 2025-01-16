import WebSocket from 'ws';
import Redis from "ioredis";
import FirestoreClient from './firestoreClient';
import { BOT_DATA } from './types';
import { config } from 'dotenv';

config();


async function doesRoomHaveBots(key: string): Promise<boolean> {
  let cursor = '0';
  do {
    const [nextCursor, results] = await redis.hscan(key, cursor);

    for (let i = 0; i < results.length; i += 2) {
      const field = results[i];
      const value = results[i + 1];
      try {
        const userData: BOT_DATA = JSON.parse(value);
        if (userData.isBot === true) {
          console.log(`Bot found in field: ${field}`);
          return true;
        }
      } catch (error) {
        console.warn(`Failed to parse JSON for field: ${field}`, error);
      }
    }

    cursor = nextCursor;
  } while (cursor !== '0');

  return false;
}

const addBotsToEnvironment =  async(key:string,roomId:string)=>{
  const fsClient = new FirestoreClient();
  const botsData:Array<BOT_DATA> =  await fsClient.getDocuments('bots');
  botsData.forEach(async bot=>{
       const randomX = Math.floor(Math.random() * SPACE_WIDTH);
       const randomY = Math.floor(Math.random() * SPACE_HEIGHT);
        const userName = bot.name
        const userPosition: UserPosition = { userId:userName, roomId:roomId, x: randomX, y: randomY };
        const metaData: BOT_DATA = {...bot};
        await redis.hset(key, userName, JSON.stringify({...userPosition,...metaData,'isBot':true}));
  });
}



const wss = new WebSocket.Server({ port: 8080 });

const redis = new Redis(`redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}`);

interface UserPosition{
  userId: string,
  roomId: string,
  x: number,
  y: number
}
const SPACE_WIDTH = 800; // Replace with your Phaser width
const SPACE_HEIGHT = 1000;

type JoinEventType = Omit<UserPosition,"x"|"y">
enum Events{
  join,
  move
}
interface CustomWebSocket extends WebSocket{
  userId? : string,
  roomId? : string
}

wss.on('connection', async (ws: CustomWebSocket) => {
  console.log('New client connected');

  ws.on('message', async(message: string) => {
    try{
      const parsedMessage = JSON.parse(message);
      console.log(parsedMessage);
      const {event, data} = parsedMessage;
      console.log(event);
      // join event
      if(event === "join"){
        const {userId, roomId}:JoinEventType = data;
        const key = `room:${roomId}`;
        const checkBots = await doesRoomHaveBots(key);
        // if(!checkBots){
        //   await addBotsToEnvironment(key,roomId);
        // }
        const randomX = Math.floor(Math.random() * SPACE_WIDTH);
        const randomY = Math.floor(Math.random() * SPACE_HEIGHT);

        const userPosition: UserPosition = { userId, roomId, x: randomX, y: randomY };
        await redis.hset(key, userId, JSON.stringify(userPosition));

        const usersInRoom = await redis.hgetall(key);

        // Send the list of existing users to the newly joined user
        const existingUsers = Object.values(usersInRoom).map((user) =>
          JSON.parse(user)
        );
        console.log('Existing Users',existingUsers);
        ws.send(
          JSON.stringify({
            event: 'existingUsers',
            data: existingUsers,
          })
        );
        console.log(`User ${userId} joined room ${roomId}`);

        ws.send(JSON.stringify({event: 'joined',data:{userId,roomId}}));
         ws['userId'] = userId;
         ws["roomId"] = roomId;
        
        broadcast(ws, roomId, {
          event: 'newUser',
          data: [{ ...userPosition }],
        });

      }
      // console.log(`Received message: ${message}`);
      // ws.send(`Server received your message: ${message}`);
      else if(event === "updateLocation"){
        const {userId, roomId, x, y, direction, velocity, footprint} = data;
        const key = `room:${roomId}`;
        const userPosition = {userId, roomId, x, y, direction, velocity, footprint};
        await redis.hset(key, userId, JSON.stringify(userPosition));
        
        console.log('user moved',userPosition);
        broadcast(ws, roomId, {
          event: 'userMoved',
          data: [{...userPosition}]
        });
      }
    }
    catch(e){
      console.log('Exception occurred',e);
    }
  });

  ws.on('close', async() => {
    const userId = ws.userId;
    const roomId = ws.roomId;

    if (userId && roomId) {
      console.log(`User ${userId} disconnected from room ${roomId}`);

      // Remove the user from Redis
      const key = `room:${roomId}`;
      await redis.hdel(key, userId);

      // Inform other users in the room that the user has left
      broadcast(ws, roomId, {
        event: 'userLeft',
        data: { userId },
      });
    }
    console.log('Client disconnected');
  });
});


//  broadcast message
const broadcast = (ws:CustomWebSocket, roomId: string, message:any )=>{
  
  wss.clients.forEach((client)=>{
    const customClient = client as CustomWebSocket;
    if(customClient!== ws &&
      customClient.readyState === WebSocket.OPEN &&
      customClient.roomId === roomId
    ){
      console.log('broadcasting....')
      customClient.send(JSON.stringify(message));
    }
  })
}
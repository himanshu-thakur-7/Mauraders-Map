import WebSocket from 'ws';
import Redis from "ioredis";

const wss = new WebSocket.Server({ port: 8080 });

const redis = new Redis({
  host:'localhost',
  port:6379
});

interface UserPosition{
  userId: string,
  roomId: string,
  x: number,
  y: number
}
const SPACE_WIDTH = 800; // Replace with your Phaser width
const SPACE_HEIGHT = 600;

type JoinEventType = Omit<UserPosition,"x"|"y">
enum Events{
  join,
  move
}
interface CustomWebSocket extends WebSocket{
  userId? : string,
  roomId? : string
}

wss.on('connection', (ws: CustomWebSocket) => {
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
        const usersInRoom = await redis.hgetall(key);

        // Send the list of existing users to the newly joined user
        const existingUsers = Object.values(usersInRoom).map((user) =>
          JSON.parse(user)
        );
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
        
         const randomX = Math.floor(Math.random() * SPACE_WIDTH);
        const randomY = Math.floor(Math.random() * SPACE_HEIGHT);

        const userPosition: UserPosition = { userId, roomId, x: randomX, y: randomY };
        await redis.hset(key, userId, JSON.stringify(userPosition));
        
        broadcast(ws, roomId, {
          event: 'newUser',
          data: { userPosition },
        });

      }
      // console.log(`Received message: ${message}`);
      // ws.send(`Server received your message: ${message}`);

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
      customClient.send(JSON.stringify(message));
    }
  })
}
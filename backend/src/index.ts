import WebSocket from 'ws';
import Redis from "ioredis";

const wss = new WebSocket.Server({ port: 8080 });

const redis = new Redis();

interface UserPosition{
  userId: string,
  roomId: string,
  x: number,
  y: number
}
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

  ws.on('message', (message: string) => {
    try{
      const parsedMessage = JSON.parse(message);
      console.log(parsedMessage);
      const {event, data} = parsedMessage;
      console.log(event);
      if(event === "join"){
        const {userId, roomId}:JoinEventType = data;
        console.log(`User ${userId} joined room ${roomId}`);

        ws.send(JSON.stringify({event: 'joined',data:{userId,roomId}}));
         ws['userId'] = userId;
         ws["roomId"] = roomId;

        broadcast(ws, roomId, {
          event: 'newUser',
          data: { userId },
        });

      }
      // console.log(`Received message: ${message}`);
      // ws.send(`Server received your message: ${message}`);

    }
    catch(e){
      console.log('Exception occurred',e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


//  broadcast message
const broadcast = (ws:CustomWebSocket, roomId: string, message:any )=>{
  wss.clients.forEach((client)=>{
    console.log(ws === client)
    const customClient = client as CustomWebSocket;
    console.log(customClient.readyState === WebSocket.OPEN);
    console.log(customClient.roomId === roomId);
    if(customClient!== ws &&
      customClient.readyState === WebSocket.OPEN &&
      customClient.roomId === roomId
    ){
      customClient.send(JSON.stringify(message));
    }
  })
}
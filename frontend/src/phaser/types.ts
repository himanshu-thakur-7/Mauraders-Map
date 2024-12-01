export type Players = {
  [key: string]: Phaser.Physics.Arcade.Sprite;
};

export type UserPosition = {
  userId: string;
  roomId: string;
  x: number;
  y: number;
};

export type WebSocketResponse = {
  event: string;
  data: Array<UserPosition> ;
};

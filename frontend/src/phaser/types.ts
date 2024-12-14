export type Players = {
  [key: string]: Phaser.Physics.Arcade.Sprite;
};

export type UserPosition = {
  userId: string;
  roomId: string;
  x: number;
  y: number;
};

export type MetaData = {
  image_url?:string,
  audio?:string
  description?:string
}
export type WebSocketResponse = {
  event: string;
  data: Array<UserPosition> ;
};

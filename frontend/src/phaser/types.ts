export type Players = {
  [key: string]: Phaser.Physics.Arcade.Sprite;
};

export type UserPosition = {
  userId: string;
  roomId: string;
  x: number;
  y: number;
  direction?: string;
  velocity?: {
    x: number;
    y: number;
  };
  footprint?: boolean;
};

export type MetaData = {
  image_url?:string,
  audio?:string,
  description?:string,
  isBot?:boolean
}
export type WebSocketResponse = {
  event: string;
  data: Array<UserPosition> ;
};

import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import FontFaceObserver from 'fontfaceobserver';
import useWebSocket, { ReadyState } from 'react-use-websocket';

type Players = {
  [key: string]: Phaser.Physics.Arcade.Sprite;
};

type UserPosition = {
  userId: string;
  roomId: string;
  x: number;
  y: number;
};

type WebSocketResponse = {
  event: string;
  data: Array<UserPosition>;
};

const PhaserGame: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserSceneRef = useRef<Phaser.Scene | null>(null);
  const playersRef = useRef<Players>({});
  const localPlayerRef = useRef<Phaser.Physics.Arcade.Sprite | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const WS_URL = 'ws://localhost:8080';
  const [existingUsers, setExistingUsers] = useState<Array<UserPosition>>([]);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<WebSocketResponse>(WS_URL, {
    share: true,
    shouldReconnect: () => true,
  });

  const localUserId = useRef(`user-${Math.random().toString(36).substring(7)}`);

  // Send join event on WebSocket connection
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        event: 'join',
        data: {
          userId: localUserId.current,
          roomId: 'hogwarts',
        },
      });
    }
  }, [readyState]);

  // Handle incoming WebSocket messages and update `existingUsers`
  useEffect(() => {
    if (lastJsonMessage) {
      console.log(lastJsonMessage);
      const response = lastJsonMessage as WebSocketResponse;
      if (response.event === 'existingUsers') {
        setExistingUsers(response.data);
        setIsDataLoaded(true); // Mark data as loaded
      }
    }
  }, [lastJsonMessage]);

  // Initialize Phaser once WebSocket data is loaded
  useEffect(() => {
    if (!isDataLoaded || !gameRef.current) return;

    const initializePhaser = () => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 800,
        parent: gameRef.current,
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scene: {
          preload,
          create,
          update,
        },
      };

      const game = new Phaser.Game(config);

      function preload(this: Phaser.Scene) {
        this.load.image('player', 'assets/player.png');
        this.load.image('background', 'assets/background.jpg');
        this.load.image('footprint','assets/footprint.png');
    }
      const FOOTPRINT_DELAY = 400;
      let lastPosition = {x:0,y:0};
      let lastFootprintTime = 0; 
      let localPlayer: Phaser.Physics.Arcade.Sprite;
      function create(this: Phaser.Scene) {
        phaserSceneRef.current = this;

        // Add and scale the background
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(1600, 1600); // Adjust dimensions to match the background

        // Set world bounds to match the background size
        this.physics.world.setBounds(0, 0, background.displayWidth, background.displayHeight);

        // Add players from initial `existingUsers`
        existingUsers.forEach(user => addOrUpdatePlayer(this, user));

        // Create the local player
        localPlayer = this.physics.add.sprite(400, 400, 'player');
        localPlayer.setScale(0.09).setDepth(1);

        // Constrain the local player within world bounds
        localPlayer.setCollideWorldBounds(true);

        // Camera follows the local player
        this.cameras.main.startFollow(localPlayer, true, 0.1, 0.1);

        // Adjust camera bounds to prevent seeing outside the background
        this.cameras.main.setBounds(0, 0, background.displayWidth, background.displayHeight);

        playersRef.current[localUserId.current] = localPlayer;
        localPlayerRef.current = localPlayer;

        // Add a label for the local player
        const label = this.add.text(400, 400, localUserId.current, {
          fontFamily: 'HarryPotter',
          fontSize: '18px',
          color: '#000000',
        });
        label.setOrigin(0.5, 0.8).setDepth(1);
        localPlayer.setData('label', label);
    }
    function update(this:Phaser.Scene,time:number){
        
        existingUsers.forEach(user => {
          if (user.userId === localUserId.current) return; // Skip local player
          const player = playersRef.current[user.userId];
          if (player) {
            player.x = user.x;
            player.y = user.y;

            const label = player.getData('label') as Phaser.GameObjects.Text;
            label.x = user.x;
            label.y = user.y ;
          }
        });
        const cursors = this.input.keyboard?.createCursorKeys();
    
          const speed = 100;
          localPlayer.setVelocity(0);
    
          lastPosition = {x:localPlayer.x,y:localPlayer.y};
          let moved = false;
          let direction = '';
    
          if (cursors?.left.isDown) {
            localPlayer.setVelocityX(-speed);
            moved = true;
            direction = 'left';
          } else if (cursors?.right.isDown) {
            localPlayer.setVelocityX(speed);
            moved = true;
            direction = 'right';
          }
    
          if (cursors?.up.isDown) {
            localPlayer.setVelocityY(-speed);
            moved = true;
            direction = 'up';
          } else if (cursors?.down.isDown) {
            localPlayer.setVelocityY(speed);
            moved = true;
            direction = 'down';
          }
    
    
          if(moved && time - lastFootprintTime > FOOTPRINT_DELAY){
            addFootprint(this,lastPosition.x,lastPosition.y+35,direction);
            lastFootprintTime = time;
          }
          // Update the label position
          const label = localPlayer.getData('label') as Phaser.GameObjects.Text;
          label.x = localPlayer.x;
          label.y = localPlayer.y;
    
    }
        // Add keyboard controls for movement
        
      
      const addFootprint = (scene: Phaser.Scene,x: number, y: number,direction:string)=>{
        const footprint = scene.add.image(x, y, 'footprint').setScale(0.05).setAlpha(0.8);
          // Set rotation based on direction
    switch (direction) {
        case 'left':
            footprint.setAngle(-90); // Rotate 90 degrees clockwise
            break;
        case 'right':
            footprint.setAngle(90); // Rotate 90 degrees anti-clockwise
            break;
        case 'down':
            footprint.setAngle(180); // Rotate 180 degrees
            break;
        case 'up':
        default:
            footprint.setAngle(0); // Default (no rotation for upward movement)
    }
        // Fade out and destroy the footprint after 1 second
        scene.tweens.add({
            targets: footprint,
            // alpha: { from: 0.8, to: 0 },
            scale: { from: 0.05, to: 0.01} ,
            duration: 1000,
            onComplete: () => {
                footprint.destroy();
            }
        });
    }

      // Handle window resizing
      const handleResize = () => {
        game.scale.resize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        game.destroy(true);
      };
    };

    // Wait for font to load before initializing Phaser
    const font = new FontFaceObserver('HarryPotter');
    font
      .load()
      .then(() => initializePhaser())
      .catch(() => initializePhaser());
  }, [isDataLoaded]);

  const addOrUpdatePlayer = (scene: Phaser.Scene, user: UserPosition) => {
    if (!playersRef.current[user.userId]) {
      const player = scene.physics.add.sprite(user.x, user.y, 'player');
      player.setScale(0.09).setDepth(1);
      playersRef.current[user.userId] = player;

      const label = scene.add.text(user.x, user.y, user.userId, {
        fontFamily: 'HarryPotter',
        fontSize: '18px',
        color: '#000000',
      });
      label.setOrigin(0.5,0.8).setDepth(1);
      player.setData('label', label);
    } else {
      const player = playersRef.current[user.userId];
      player.x = user.x;
      player.y = user.y;

      const label = player.getData('label') as Phaser.GameObjects.Text;
      label.x = user.x;
      label.y = user.y;
    }
  };

  return <div ref={gameRef} style={{ width: '100%', height: '100%' }} />;
};

export default PhaserGame;

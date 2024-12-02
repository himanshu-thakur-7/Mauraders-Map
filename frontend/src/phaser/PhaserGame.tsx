import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import FontFaceObserver from 'fontfaceobserver';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {Players, UserPosition, WebSocketResponse} from "./types";
import {COOLDOWN_TIME,WS_URL,FOOTPRINT_DELAY} from "./constants";
import {getRandomDirection,getNextDirectionOnCollision,sleep} from "./helper";
import Loader from '../components/loader/loader';

const PhaserGame: React.FC = () => {
  
  const [isLoading, setIsLoading] = useState(true);
  const collisionCooldowns = new Map(); // Key: player pair, Value: timestamp
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserSceneRef = useRef<Phaser.Scene | null>(null);
  const playersRef = useRef<Players>({});
  const localPlayerRef = useRef<Phaser.Physics.Arcade.Sprite | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [existingUsers, setExistingUsers] = useState<Array<UserPosition>>([]);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<WebSocketResponse>(WS_URL, {
    share: true,
    shouldReconnect: () => true,
  });


  const playersGroupRef = useRef<Phaser.Physics.Arcade.Group | null>(null);
  const localUserId = useRef(`user-${Math.random().toString(36).substring(7)}`);
  let localPlayer: Phaser.Physics.Arcade.Sprite;
  let lastPosition = {x:0,y:0};
  let lastFootprintTime = 0; 

  function setupPlayerCollisions(scene: Phaser.Scene) {
    const playerGroup = scene.physics.add.group(); // Group for player sprites

    // Add existing players to the group
    Object.values(playersRef.current).forEach(player => {
        playerGroup.add(player);
    });

   scene.physics.add.collider(playerGroup, playerGroup, (player1, player2) => {
    if (player1 instanceof Phaser.Physics.Arcade.Sprite && player2 instanceof Phaser.Physics.Arcade.Sprite) {
        // Create a unique key for the player pair (ensure consistent ordering)
        const id1 = (player1 as any).data.values.label._text;
        const id2 = (player2 as any).data.values.label._text;
        const pairKey = [id1, id2].sort().join('-'); // Ensure unique key irrespective of order

        const currentTime = Date.now();

        // Check if this pair is on cooldown
        if (collisionCooldowns.has(pairKey)) {
            const lastCollisionTime = collisionCooldowns.get(pairKey);
            if (currentTime - lastCollisionTime < COOLDOWN_TIME) {
                return; // Ignore collision if still on cooldown
            }
        }

        // Log the collision
        console.log('Collision detected between:', id1, id2);

        // Check if the local user is involved
        if (id1 === localUserId.current || id2 === localUserId.current) {
            alert(`You met ${id1 === localUserId.current ? id2 : id1}. Want to have video call or chat?`);

            // Example collision response
            const tempVelocityX = player1.body?.velocity.x;
            const tempVelocityY = player1.body?.velocity.y;

            if (player1.body && player2.body) {
                player1.body.velocity.x = player2.body.velocity.x * -1;
                player1.body.velocity.y = player2.body.velocity.y * -1;

                player2.body.velocity.x = tempVelocityX !== undefined ? tempVelocityX * -1 : 0;
                player2.body.velocity.y = tempVelocityY !== undefined ? tempVelocityY * -1 : 0;
            }
        }

        // Update cooldown for this pair
        collisionCooldowns.set(pairKey, currentTime);

        // Clean up expired cooldown entries after the cooldown period
        setTimeout(() => collisionCooldowns.delete(pairKey), COOLDOWN_TIME);
    } 
  });
  }
  
  function addOrUpdatePlayer(scene: Phaser.Scene, user: UserPosition){
  if (user.userId !== localUserId.current) {
    if (!playersRef.current[user.userId]) {
      const player = scene.physics.add.sprite(user.x, user.y, 'player');
      player.setScale(0.09).setDepth(1);
      player.setCollideWorldBounds(true);
      player.setBounce(1); // Enable bounce on collision

      playersRef.current[user.userId] = player;

      const label = scene.add.text(user.x, user.y, user.userId, {
        fontFamily: 'HarryPotter',
        fontSize: '18px',
        color: '#000000',
      });
      label.setOrigin(0.5, 0.8).setDepth(1);
      player.setData('label', label);

      // Add the player to the persistent group
      if (playersGroupRef.current) {
        playersGroupRef.current.add(player);
      }

      // Reapply player collisions
      setupPlayerCollisions(scene);
    } else {
      const player = playersRef.current[user.userId];
      player.x = user.x;
      player.y = user.y;

      const label = player.getData('label') as Phaser.GameObjects.Text;
      label.x = user.x;
      label.y = user.y;
    }
  }
};
    
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
      else if(response.event === 'newUser')
      {
        console.log(response.data[0]);
       setExistingUsers((prevExistingUsers) => {
        // Ensure no duplicate entries based on userId
        const isUserAlreadyPresent = prevExistingUsers.some(
          (user) => user.userId === response.data[0].userId
        );
        if (!isUserAlreadyPresent) {
          return [...prevExistingUsers, response.data[0]];
        }
        return prevExistingUsers;
      });
        console.log('User List Updated After New User',existingUsers);
      }
    }
  }, [lastJsonMessage]);

 useEffect(() => {
  // Ensure that each player in `existingUsers` is added or updated in the Phaser scene
  if (phaserSceneRef.current && isDataLoaded) {
    existingUsers.forEach(user => {
      if (phaserSceneRef.current) {
        addOrUpdatePlayer(phaserSceneRef.current, user);
      }
    });
  }
}, [existingUsers, isDataLoaded]);
  // Initialize Phaser once WebSocket data is loaded

  useEffect(() => {
    if (!isDataLoaded || !gameRef.current) return;

    const initializePhaser = () => {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
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
        console.log('Started loading')
        // this.load.image('tiles', 'assets/TileSet.jpg'); // Tileset image
        // this.load.tilemapTiledJSON('map', 'assets/MauraderMap.json'); // Tiled JSON file

        this.load.image('player', 'assets/player.png');
        this.load.image('background', 'assets/TileSet.jpg');
        this.load.image('footprint','assets/footprint.png');

        setIsLoading(false);
    }
     
    
    function create(this: Phaser.Scene) {
        phaserSceneRef.current = this;
        // const map = this.make.tilemap({ key: 'map' });
        // console.log(map);
      // Add tileset image (must match name in Tiled)
        // const tileset = map.addTilesetImage('TilesetName', 'tiles');

        // Add and scale the background
        const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        background.setDisplaySize(1600, 1600); // Adjust dimensions to match the background

        // Set world bounds to match the background size
        this.physics.world.setBounds(0, 0, background.displayWidth, background.displayHeight);

        // Add players from initial `existingUsers`
        existingUsers.forEach(user => addOrUpdatePlayer(this, user));
        // Add colliders for players
        setupPlayerCollisions(this);
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

        if (playersGroupRef.current) {
        playersGroupRef.current.add(localPlayer);
      }
        setupPlayerCollisions(this);
        // Add a label for the local player
        const label = this.add.text(400, 400, localUserId.current, {
          fontFamily: 'HarryPotter',
          fontSize: '18px',
          color: '#000000',
        });
        label.setOrigin(0.5, 0.8).setDepth(1);
        localPlayer.setData('label', label);
    }

  async function moveBots(scene: Phaser.Scene, time: number, speed: number) {
    for (const user of existingUsers) {
      if (user.userId === localUserId.current) continue; // Skip local player

      const player = playersRef.current[user.userId];
      if (player) {
        // Retrieve or initialize movement state
        let direction = player.getData('direction');
        let stepsRemaining = player.getData('stepsRemaining');
        const lastFootPrintTime = player.getData('lastFootPrintTime') || 0;

        if (!direction || stepsRemaining === undefined || stepsRemaining <= 0) {
          // Set a new random direction and steps for 10 moves
          direction = getRandomDirection();
          stepsRemaining = 10;
          player.setData('direction', direction);
          player.setData('stepsRemaining', stepsRemaining);
        }

        // Check for border collision
        if (isHittingBorder(player, scene)) {
          direction = getNextDirectionOnCollision(direction);
          stepsRemaining = 20; // Fixed movement for 20 moves after collision
          player.setData('direction', direction);
          player.setData('stepsRemaining', stepsRemaining);
        }

        // Update position based on direction
        const lastX = player.x;
        const lastY = player.y;

        movePlayerInDirection(player, direction, speed);

        const diff = Math.round(time - lastFootPrintTime);
        if (diff > 800) {
          player.setData('lastFootPrintTime', time);
          addFootprint(scene, lastX, lastY + 35, direction);
        }

        // Update remaining steps
        player.setData('stepsRemaining', stepsRemaining - 1);

        // Update label position
        const label = player.getData('label') as Phaser.GameObjects.Text;
        label.x = player.x;
        label.y = player.y;
      }

      // Wait for 500ms before processing the next bot
    }
    await sleep(100);

  
}

// Helper: Check if player is hitting a border
function isHittingBorder(player: Phaser.Physics.Arcade.Sprite, scene: Phaser.Scene): boolean {
  const { x, y } = player;
  const bounds = scene.physics.world.bounds;

  return x <= bounds.x+3 || x >= bounds.width-3 || y <= bounds.y+3 || y >= bounds.height-3;
}

// Helper: Move player in the given direction
function movePlayerInDirection(player: Phaser.Physics.Arcade.Sprite, direction: string, speed: number) {
  switch (direction) {
    case 'left':
      player.setVelocityX(-speed)
      break;
    case 'right':
      player.setVelocityX(speed)
      break;
    case 'up':
      player.setVelocityY(-speed)
      break;
    case 'down':
      player.setVelocityY(speed)
      break;
  }
}
    let isBotMoving = false;
    function update(this:Phaser.Scene,time:number){

        const cursors = this.input.keyboard?.createCursorKeys();
        
        const speed = 50;
        if (!isBotMoving) {
          isBotMoving = true;
          moveBots(this, time, 10).finally(() => {
            isBotMoving = false;
          });
        }
        // moveBots(this,time,speed);
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
        const footprint = scene.add.image(x, y, 'footprint').setScale(0.05).setAlpha(0.7);
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

  return <div>
    {isLoading ? <Loader/>:<></>
    
  }
  <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
    
    </div>
    
};

export default PhaserGame;

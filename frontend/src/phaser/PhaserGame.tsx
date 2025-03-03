import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import FontFaceObserver from 'fontfaceobserver';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {Players, UserPosition, WebSocketResponse,MetaData} from "./types";
import {COOLDOWN_TIME,WS_URL,FOOTPRINT_DELAY} from "./constants";
import {getRandomDirection,getNextDirectionOnCollision,sleep} from "./helper";
import Loader from '../components/loader/loader';
import ChatScreen from '@/components/ChatScreen';
import { useRecoilState, useRecoilValue } from 'recoil';
import {chatSheetAtom,chatUserAtom} from "../recoil/atoms/chatSheetAtom";
import {chatSheetToggle} from "../recoil/selectors/chatSheetSelector";

declare module 'phaser' {
  interface Scene {
    backgroundMusic: Phaser.Sound.BaseSound;
    muteButton: Phaser.GameObjects.Image;
  }
}

const PhaserGame: React.FC = () => {
  
  const [isLoading, setIsLoading] = useState(true);
  const collisionCooldowns = new Map(); // Key: player pair, Value: timestamp
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserSceneRef = useRef<Phaser.Scene | null>(null);
  const playersRef = useRef<Players>({});
  const localPlayerRef = useRef<Phaser.Physics.Arcade.Sprite | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [existingUsers, setExistingUsers] = useState<Array<UserPosition & MetaData>>([]);
  const [, setToggleChatSheet] = useRecoilState(chatSheetAtom);
  const [, setChatUser] = useRecoilState(chatUserAtom);
  // OR if you only need to read
  const toggleChatSheetValue = useRecoilValue(chatSheetToggle);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<WebSocketResponse>(WS_URL, {
    protocols:["Authorization",localStorage.getItem('token')!],
    share: true,
    shouldReconnect: () => true,
  });
  const game = useRef<Phaser.Game | null>(null);

  const playersGroupRef = useRef<Phaser.Physics.Arcade.Group | null>(null);
  const localUserId = useRef(`user-${Math.random().toString(36).substring(7)}`);
  let localPlayer: Phaser.Physics.Arcade.Sprite;
  let lastPosition = {x:0,y:0};
  let lastFootprintTime = 0; 

  function setupPlayerCollisions(scene: Phaser.Scene) {
    const playerGroup = scene.physics.add.group(); // Group for player sprites

    // // Add existing players to the group
    Object.values(playersRef.current).forEach(player => {
        playerGroup.add(player);
    });

    const localPlayerGroup = scene.physics.add.group();
    const otherPlayersGroup = scene.physics.add.group();


     // Add local player to its group
    const localPlayer = playersRef.current[localUserId.current];
    if (localPlayer) {
        localPlayerGroup.add(localPlayer);
    }

    // Add other players to their group
    Object.entries(playersRef.current).forEach(([id, player]) => {
        if (id !== localUserId.current) {
            otherPlayersGroup.add(player);
        }
    });
    
scene.physics.add.collider(playerGroup, playerGroup, (player1, player2) => {
    if (player1 instanceof Phaser.Physics.Arcade.Sprite && player2 instanceof Phaser.Physics.Arcade.Sprite) {
        // Create a unique key for the player pair (ensure consistent ordering)
        const id1 = (player1.getData('label') as Phaser.GameObjects.Text).text;
        const id2 = (player2.getData('label') as Phaser.GameObjects.Text).text;
        const pairKey = [id1, id2].sort().join('-'); // Ensure unique key irrespective of order
        const currentTime = Date.now();

        // player1.setVelocity(0, 0);
        // player2.setVelocity(0, 0);

        // Only process collision if local player is involved
        // const isLocalPlayerInvolved = id1 === localUserId.current || id2 === localUserId.current;
        
        // if (!isLocalPlayerInvolved) {
        //     return; // Skip collision processing for spectators
        // }

         const isPlayer1Local = id1 === localUserId.current;
          const otherUser = isPlayer1Local ? id2 : id1;
        //  const otherUser = id1 === localUserId.current ? id2 : id1;
        const x = existingUsers.filter((u)=>u.userId===otherUser)[0];
        const cooldownDuration = x.isBot ? COOLDOWN_TIME : COOLDOWN_TIME * 2;

  // Force immediate stop for both sprites
         if (player1.body) {
            player1.body.stop();
            if (player1.body instanceof Phaser.Physics.Arcade.Body) {
                player1.body.setVelocity(0, 0);
            }
            player1.setVelocity(0, 0);
            player1.setAcceleration(0, 0);
        }
        
        if (player2.body) {
            player2.body.stop();
            if (player2.body instanceof Phaser.Physics.Arcade.Body) {
                player2.body.setVelocity(0, 0);
            }
            player2.setVelocity(0, 0);
            player2.setAcceleration(0, 0);
        }

        
        sendJsonMessage({
            event: 'updateLocation',
            data: {
                userId: localUserId.current,
                roomId: 'hogwarts',
                x: localUserId.current === id1 ? player1.x : player2.x,
                y: localUserId.current === id1 ? player1.y : player2.y,
                velocity: { x: 0, y: 0 }
            }
        });
        // Check if this pair is on cooldown
        if (collisionCooldowns.has(pairKey)) {
            const lastCollisionTime = collisionCooldowns.get(pairKey);
            if (currentTime - lastCollisionTime < cooldownDuration) {
                return; // Ignore collision if still on cooldown
            }
        }
  // Check if either player is a bot
        // const player1Data = existingUsers.find(u => u.userId === id1);
        // const player2Data = existingUsers.find(u => u.userId === id2);
        // const isBot = player1Data?.isBot || player2Data?.isBot;

        //  // Only apply bounce effect if at least one player is a bot
        // if (isBot) {
        //     const tempVelocityX = player1.body?.velocity.x;
        //     const tempVelocityY = player1.body?.velocity.y;

        //     if (player1.body && player2.body) {
        //         player1.body.velocity.x = player2.body.velocity.x * -1;
        //         player1.body.velocity.y = player2.body.velocity.y * -1;

        //         player2.body.velocity.x = tempVelocityX !== undefined ? tempVelocityX * -1 : 0;
        //         player2.body.velocity.y = tempVelocityY !== undefined ? tempVelocityY * -1 : 0;
        //     }
        // }
        // Log the collision
        console.log('Collision detected between:', id1, id2);

        // Check if the local user is involved
        if (id1 === localUserId.current || id2 === localUserId.current) {
            // alert(`You met ${id1 === localUserId.current ? id2 : id1}. Want to have video call or chat?`);
            // const otherUser = id1 === localUserId.current ? id2 : id1;
            // const x = existingUsers.filter((u)=>u.userId===otherUser)[0];
            
            // Apply bounce effect only for bot collisions
            if (x.isBot && player1.body && player2.body) {
              console.log('Applying bounce effect');
              const tempVelocityX = player1.body.velocity.x;
              const tempVelocityY = player1.body.velocity.y;
              
              player1.body.velocity.x = player2.body.velocity.x * -1;
              player1.body.velocity.y = player2.body.velocity.y * -1;
              player2.body.velocity.x = tempVelocityX * -1;
              player2.body.velocity.y = tempVelocityY * -1;
            }
            
            game.current?.pause();
            setChatUser({
              name: x.userId,
              image_url: x.image_url!,
              audio: x.audio!,
              description:x.description!
            })
            setToggleChatSheet(true);
        }

        // Update cooldown for this pair
        collisionCooldowns.set(pairKey, currentTime);

        // Clean up expired cooldown entries after the cooldown period
        setTimeout(() => collisionCooldowns.delete(pairKey), COOLDOWN_TIME);
    } 
  });  }  

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
  }, [readyState, sendJsonMessage]);
  // Handle incoming WebSocket messages and update `existingUsers`
  useEffect(() => {
    if (lastJsonMessage) {
      const response = lastJsonMessage as WebSocketResponse;
      if (response.event === 'existingUsers') {
        console.log('Existing Users:',response.data);
        setExistingUsers(response.data);
        setIsDataLoaded(true);
      }
      else if(response.event === 'newUser') {
        setExistingUsers(prevUsers => {
          const newUser = response.data[0];
          const isUserPresent = prevUsers.some(user => user.userId === newUser.userId);
          if (!isUserPresent) {
            return [...prevUsers, newUser]; 
          }
          return prevUsers;
        });
      }
      else if(response.event === 'userMoved'){
        // console.log(response.data);
        const {userId, x, y, velocity,footprint,direction} = response.data[0];
        const player = playersRef.current[userId];
        
        if (player) {
          player.x = x;
          player.y = y;
          player.setVelocity(velocity!.x, velocity!.y);
          
          // Update label position
          const label = player.getData('label') as Phaser.GameObjects.Text;
          label.x = x;
          label.y = y;
          
          // Add footprint if needed
          if (footprint) {
            console.log('Adding footprint');
            addFootprint(phaserSceneRef.current!, x, y + 35, direction!);
          }
        }
      }
    }
  }, [lastJsonMessage, existingUsers]); // Add existingUsers as dependency
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
         audio: {
          disableWebAudio: false
        },
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
      
      game.current = new Phaser.Game(config);

      function preload(this: Phaser.Scene) {
        console.log('Started loading')
        // this.load.image('tiles', 'assets/TileSet.jpg'); // Tileset image
        // this.load.tilemapTiledJSON('map', 'assets/MauraderMap.json'); // Tiled JSON file

        this.load.image('player', 'assets/player.png');
        this.load.image('background', 'assets/TileSet.jpg');
        this.load.image('footprint','assets/footprint.png');
        this.load.audio('backgroundMusic', 'assets/bg.mp3');
        this.load.image('muteIcon','assets/unmute.svg');
        this.load.image('unmuteIcon','assets/mute.svg')
        setIsLoading(false);
    }
     
    
    function create(this: Phaser.Scene) {
        phaserSceneRef.current = this;
        // const map = this.make.tilemap({ key: 'map' });
        // console.log(map);
      // Add tileset image (must match name in Tiled)
        // const tileset = map.addTilesetImage('TilesetName', 'tiles');

        // Play background music
        this.backgroundMusic = this.sound.add('backgroundMusic', {
          volume: 0.2, // Adjust volume as needed
          loop: true // Ensures it loops continuously
        });
        this.backgroundMusic.play();

        // Add mute/unmute button at top-right corner
        this.muteButton = this.add.image(30, 30, 'unmuteIcon')
          .setInteractive()
          .setScale(2) // Adjust size as needed
          .setOrigin(0.5, 0.5)
          .setScrollFactor(0) // Ensures it stays in place when the camera moves
          .setDepth(10); // Ensures the button stays on top of everything

        // Mute/Unmute toggle logic
        this.muteButton.on('pointerdown', () => {
          if (this.backgroundMusic.isPlaying) {
            this.backgroundMusic.pause(); // Pause the music
            this.muteButton.setTexture('muteIcon'); // Switch to mute icon
          } else {
            this.backgroundMusic.resume(); // Resume the music
            this.muteButton.setTexture('unmuteIcon'); // Switch back to unmute icon
          }
        });
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
      if (user.userId === localUserId.current || !user.isBot) continue; // Skip local player

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
    
          // if (moved) {
            // const shouldAddFootprint = time - lastFootprintTime > FOOTPRINT_DELAY;
            
            // if(shouldAddFootprint) {
            //   addFootprint(this, lastPosition.x, lastPosition.y+35, direction);
            //   lastFootprintTime = time;
            // }

            sendJsonMessage({
              event: 'updateLocation',
              data: {
                userId: localUserId.current,
                roomId: 'hogwarts',
                x: localPlayer.x,
                y: localPlayer.y,
                direction: direction,
                velocity: {
                  x: localPlayer.body?.velocity.x || 0,
                  y: localPlayer.body?.velocity.y || 0
                },
                footprint: moved && (time - lastFootprintTime > FOOTPRINT_DELAY)
              }
            });
          // }
        if (moved && time - lastFootprintTime > FOOTPRINT_DELAY) {
            addFootprint(this, lastPosition.x, lastPosition.y + 35, direction);
            lastFootprintTime = time;
          }
                  // Update the label position
          const label = localPlayer.getData('label') as Phaser.GameObjects.Text;
          label.x = localPlayer.x;
          label.y = localPlayer.y;
    }
        // Add keyboard controls for movement
        
      
  
      // Handle window resizing
      const handleResize = () => {
        game.current?.scale.resize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        game.current?.destroy(true);
      };
    };

    // Wait for font to load before initializing Phaser
    const font = new FontFaceObserver('HarryPotter');
    font
      .load()
      .then(() => initializePhaser())
      .catch(() => initializePhaser());
  }, [isDataLoaded]);

useEffect(() => {
    if(game.current) {
        if(toggleChatSheetValue === false) {
            game.current.resume();
            // Broadcast game resume state
            sendJsonMessage({
                event: 'updatePauseState',
                data: {
                    userId: localUserId.current,
                    roomId: 'hogwarts',
                    isPaused: false
                }
            });
        }
    }
}, [toggleChatSheetValue]);

return <div>
    {isLoading ? <Loader/>:<></>
    
  }
  <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
   { toggleChatSheetValue ? <ChatScreen></ChatScreen> : <></> }
    </div>
    
};

export default PhaserGame;

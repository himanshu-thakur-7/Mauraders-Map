import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const PhaserGame: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
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
            this.load.image('player', 'assets/player.png'); // Replace with your sprite
            this.load.image('background', 'assets/background.jpg'); // Replace with your background
            this.load.image('footprint','assets/footprint.png')
        }

        let player: Phaser.Physics.Arcade.Sprite;
        let usernameText: Phaser.GameObjects.Text; // For displaying username inside the banner
        const username = "Albus Dumbledoor"; 
        let lastPosition = {x:0,y:0};
        let lastFootprintTime = 0; // Tracks the last time a footprint was added
        const FOOTPRINT_DELAY = 400; // Delay between footprints in milliseconds
        function create(this: Phaser.Scene) {
            const background = this.add.image(0, 0, 'background').setOrigin(0, 0); 
            background.setDisplaySize(this.scale.width, this.scale.height);// Center background
            player = this.physics.add.sprite(50, 50, 'player').setScale(0.09); // Start position
            player.setCollideWorldBounds(true); // Prevent moving out of bounds
             // Add the username text inside the banner
            usernameText = this.add.text(player.x, player.y, username, {
                fontFamily: 'HarryPotter', // You can replace this with your custom font if needed
                fontSize: '18px',
                color: '#000000', // Adjust text color to make it visible
                fontStyle: 'normal',
                align: 'center',
            }).setOrigin(0.5, 0.8); // Center text within the banner

            // Make sure the text stays within the banner as it moves
            usernameText.setPosition(player.x, player.y);
        }

        function update(this: Phaser.Scene,time: number) {
            const cursors = this.input.keyboard?.createCursorKeys();
             let moved = false;
             let direction = '';
               if (cursors?.left.isDown) {
                lastPosition = { x: player.x, y: player.y }; // Store current position
                player.x -= 1; // Move left
                moved = true;
                direction = 'left';
            } else if (cursors?.right.isDown) {
                lastPosition = { x: player.x, y: player.y }; // Store current position
                player.x += 1; // Move right
                moved = true;
                direction = 'right';
            } else if (cursors?.up.isDown) {
                lastPosition = { x: player.x, y: player.y }; // Store current position
                player.y -= 1; // Move up
                moved = true;
                direction = 'up';
            } else if (cursors?.down.isDown) {
                lastPosition = { x: player.x, y: player.y }; // Store current position
                player.y += 1; // Move down
                moved = true;
                direction = 'down';
            }
            
                if (moved && time - lastFootprintTime >FOOTPRINT_DELAY) {
                addFootprint(this, lastPosition.x, lastPosition.y+35,direction);
                lastFootprintTime = time; // Update the last footprint time
            }
              // Update the player name text position to stay with the banner
            usernameText.setPosition(player.x, player.y);
        }

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

        const handleResize = () => {
            game.scale.resize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            game.destroy(true);
        };
    }, []);

    return null;
};

export default PhaserGame;

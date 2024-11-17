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
        let lastPosition = {x:0,y:0};
        let lastFootprintTime = 0; // Tracks the last time a footprint was added
        const FOOTPRINT_DELAY = 400; // Delay between footprints in milliseconds
        function create(this: Phaser.Scene) {
            const background = this.add.image(0, 0, 'background').setOrigin(0, 0); 
            background.setDisplaySize(this.scale.width, this.scale.height);// Center background
            player = this.physics.add.sprite(50, 50, 'player').setScale(0.09); // Start position
            player.setCollideWorldBounds(true); // Prevent moving out of bounds
        }

        function update(this: Phaser.Scene,time: number) {
            const cursors = this.input.keyboard?.createCursorKeys();
             let moved = false;
               if (cursors?.left.isDown) {
                lastPosition = { x: player.x, y: player.y }; // Store current position
                player.x -= 2; // Move left
                moved = true;
            } else if (cursors?.right.isDown) {
                lastPosition = { x: player.x, y: player.y }; // Store current position
                player.x += 2; // Move right
                moved = true;
            } else if (cursors?.up.isDown) {
                lastPosition = { x: player.x, y: player.y }; // Store current position
                player.y -= 2; // Move up
                moved = true;
            } else if (cursors?.down.isDown) {
                lastPosition = { x: player.x, y: player.y }; // Store current position
                player.y += 2; // Move down
                moved = true;
            }
            
                if (moved && time - lastFootprintTime >FOOTPRINT_DELAY) {
                addFootprint(this, lastPosition.x, lastPosition.y+35);
                lastFootprintTime = time; // Update the last footprint time
            }
        }

        const addFootprint = (scene: Phaser.Scene,x: number, y: number)=>{
        const footprint = scene.add.image(x, y, 'footprint').setScale(0.05).setAlpha(0.8);

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

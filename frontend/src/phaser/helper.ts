export function getRandomDirection(): string {
    const directions = ['left', 'right', 'up', 'down'];
    return directions[Math.floor(Math.random() * directions.length)];
  }
export function sleep(ms:number) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }
  // Helper: Get the next direction on collision
export function getNextDirectionOnCollision(currentDirection: string): string {
  switch (currentDirection) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    default:
      return getRandomDirection();
  }
}
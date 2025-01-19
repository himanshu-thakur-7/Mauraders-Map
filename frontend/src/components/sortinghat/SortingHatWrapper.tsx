import { useState } from 'react';
import SortingHat from './SortingHat';
import Avatar from './Avatar';
import './style.css';

interface SortingHatWrapperProps {
  size?: 'small' | 'medium' | 'large';
}

function SortingHatWrapper({ size = 'small' }: SortingHatWrapperProps) {
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hairStyle, setHairStyle] = useState<'short' | 'long'>('short');

  const handleSort = () => {
    const houses = ['hufflepuff', 'gryffindor', 'ravenclaw', 'slytherin'];
    setIsAnimating(false);
    setSelectedHouse('');

    setTimeout(() => {
      setIsAnimating(true);
      const randomHouse = houses[Math.floor(Math.random() * houses.length)];
      setSelectedHouse(randomHouse);
    }, 1000);
  };

  const sizeClasses = {
    small: 'scale-100',
    medium: 'scale-75',
    large: 'scale-100'
  };
 const toggleHairStyle = () => {
    setHairStyle(prevStyle => prevStyle === 'short' ? 'long' : 'short');
  };
  return (
    <div className={`main-content__wrapper ${selectedHouse} ${sizeClasses[size]}`}>
      <div className="main-content" style={{top: '50%', transform: 'translate(0%, -50%)'}}>
        <SortingHat 
          isAnimating={isAnimating} 
          selectedHouse={selectedHouse} 
        />
        <Avatar 
          isAnimating={isAnimating} 
          hairStyle={hairStyle}
        />
        <div>
          <button className="sort-house" onClick={handleSort} style={{marginTop: '20px'}} type='button'>
            Sort Me!
          </button>
        </div>
          <button 
          onClick={toggleHairStyle}
          className="hair-toggle"
          type="button"
          style={{
            position: 'absolute',
            bottom: '-140px',
            left: '-100px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '48px'
          }}
        >
          {hairStyle === 'long' ? '👩' : '🧔‍♂️'}
        </button>

      </div>
    </div>
  );
}

export default SortingHatWrapper;
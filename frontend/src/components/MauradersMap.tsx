import { useEffect } from 'react';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import '../styles/map.css';

interface MaraudersMapProps {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;

  setLoadGame: (isGameLoaded: boolean) => void;
}

const MaraudersMap = ({ isActive, setIsActive,setLoadGame }: MaraudersMapProps) => {
  const { startVoiceRecognition } = useVoiceCommands(setIsActive);

  useEffect(() => {
    startVoiceRecognition();
  }, [startVoiceRecognition]);

  return (
    <div className={`map-base w-[306px] h-[600px] relative inline-block ${isActive ? 'active' : ''}`}>
      
      <div className="map-flap flap--1">
        <div className="map-flap__front">
        </div>
        <div className="map-flap__back">
            
        </div>
        <img src='assets/harryedvige5.png' style={{'rotate':'180deg'}} className='absolute -bottom-16 -mb-4' ></img>
      </div>
      <div className='justify-center mt-72'>
          <button onClick={()=>{
            setLoadGame(true);
          }}>Start Game</button>
      </div>
      <div className="map-flap flap--2">
        
        <div className="map-flap__front">
            
        </div>
        
        <div className="map-flap__back"></div>
      </div>
      
      <div className="map-side side-1">
        <div className="front" style={{ 'background-color': '#EBDCA5','height':600,'width':157 } as React.CSSProperties}>
        </div>
        <div className="back"></div>
      </div>
      <div className="map-side side-2">
        <div className="front" style={{'background-color': '#EBDCA5','height':600,'width':157} as React.CSSProperties}></div>
        <div className="back"></div>
      </div>
      <div className="map-side side-3">
        <div className="front" style={{ '--image': "url('https://meowlivia.s3.us-east-2.amazonaws.com/codepen/map/7.png')" } as React.CSSProperties}></div>
        <div className="back"></div>
      </div>
      <div className="map-side side-4">
        <div className="front" style={{ '--image': "url('https://meowlivia.s3.us-east-2.amazonaws.com/codepen/map/10.png')" } as React.CSSProperties}></div>
      </div>
      <div className="map-side side-5">
        <div className="front" style={{ '--image': "url('https://meowlivia.s3.us-east-2.amazonaws.com/codepen/map/6.png')" } as React.CSSProperties}></div>
        <div className="back"></div>
      </div>
      <div className="map-side side-6">
        <div className="front" style={{ '--image': "url('https://meowlivia.s3.us-east-2.amazonaws.com/codepen/map/11.png')" } as React.CSSProperties}></div>
        <div className="back"></div>
      </div>
    </div>
  );
};

export default MaraudersMap;
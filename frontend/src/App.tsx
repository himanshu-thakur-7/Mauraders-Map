import { useState } from 'react';
import MaraudersMap from './components/MauradersMap';
import MapToggle from './components/MapToggle';
import Instructions from './components/Instructions';
import Footer from './components/Footer';
import PhaserGame from './phaser/PhaserGame';

function App() {
  const [isMapActive, setIsMapActive] = useState(false);
  const [isLoadGame,setLoadGame] = useState(false);
  return (
    <div>
      {
      !isLoadGame ? (
        <div className="min-h-screen bg-[#222] font-['Comfortaa']">
          <div className="main-content text-center mt-1 ml-12 pt-24">
            <MaraudersMap isActive={isMapActive} setIsActive={setIsMapActive} setLoadGame={setLoadGame}/>
            {/* <MapToggle isActive={isMapActive} setIsActive={setIsMapActive}></MapToggle> */}
            <Instructions isActive={isMapActive} setIsActive={setIsMapActive} />
          </div>
          <Footer />
        </div>): <PhaserGame/>
  
      }
    </div>
  );
}

export default App;
import { useEffect } from 'react';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import '../styles/map.css';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

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
          <Dialog>
          <DialogTrigger asChild>
            <Button variant="link">Welcome To Hogwarts</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Welcome to Hogwarts</DialogTitle>
              <DialogDescription>
                Choose your way to enter the magical world
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm/>
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm/>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      <div className="map-flap flap--2">
        
        <div className="map-flap__front">
            
        </div>
        
        <div className="map-flap__back"></div>
      </div>
      
      <div className="map-side side-1">
        <div className="front" style={{ 'backgroundColor': '#EBDCA5','height':600,'width':157 } as React.CSSProperties}>
        </div>
        <div className="back"></div>
      </div>
      <div className="map-side side-2">
        <div className="front" style={{'backgroundColor': '#EBDCA5','height':600,'width':157} as React.CSSProperties}></div>
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
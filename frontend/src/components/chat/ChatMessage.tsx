import React from 'react';
import { AudioPlayer } from '../audio/AudioPlayer';
import { ChatMessageProps } from './types';

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.sender === 'ai';
  
  return (
    <div className={`flex items-start gap-2 mb-4 ${isAI ? '' : 'justify-end'}`}>
      {isAI && (
        <img
          src="assets/Snape.png"
          alt="AI Avatar"
          className="w-8 h-8 rounded-full"
        />
      )}
      
      <div className={`flex flex-col ${isAI ? '' : 'items-end'}`}>
        {message.audioURL !== '' && message.audioLength !== undefined && (
          <AudioPlayer audioURL={message.audioURL} duration={message.audioLength}/>
        )}
        
        <div className={`max-w-[80%] rounded-lg p-3 ${
          isAI 
            ? 'bg-gray-100 text-gray-900' 
            : 'bg-amber-600 text-white'
        }`}>
          {message.action && (
            <span className="text-gray-500 italic">{message.action} </span>
          )}
          {message.content}
        </div>
      </div>

      {!isAI && (
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop"
          alt="User Avatar"
          className="w-8 h-8 rounded-full"
        />
      )}
    </div>
  );
}
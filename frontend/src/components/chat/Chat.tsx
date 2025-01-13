import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { Message,AIChatResponse } from './types';
import { TypingIndicator } from './TypingIndicator';
import axios, {AxiosResponse} from "axios";
import {chatUserAtom} from "../../recoil/atoms/chatSheetAtom";

import { useRecoilValue } from 'recoil';

const initialMessages: Message[] = [];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState<'user' | 'ai' | null>(null);
  const user = useRecoilValue(chatUserAtom);
  // Ref for the chat container
  const chatContainerRef = useRef<HTMLDivElement>(null);
  let audioUrl = '';
  let [audioDuration,setAudioDuration] = useState(0);
  // Scroll to the bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


    // Function to convert base64 to Blob
  const base64ToBlob = (base64:string, mimeType:string):Blob => {
    const base64WithPrefix = base64.startsWith('data:') 
        ? base64 
        : `data:${mimeType};base64,${base64}`;
        
    const base64Data = base64WithPrefix.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });

  };

  const handleSendMessage =  async (content: string) => {
    const newMessage: Message = {
      id: String(messages.length + 1),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
   
    setIsTyping('ai');

    const response: AxiosResponse = await axios.post('https://nodejs.34.57.252.146.nip.io/chat',{
        "character":user.name,
        "Message":content,
        "session":`${Math.random()} ID`,
        "audio":user.audio
    });
    
    const responseData: AIChatResponse = response.data;
    console.log('RD:',responseData)
    if(responseData.Audio){
        const audioBlob:Blob = base64ToBlob(responseData.Audio, 'audio/mpeg');
        console.log('blob:::',audioBlob)
        audioUrl = URL.createObjectURL(audioBlob);
        console.log(audioUrl)
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
            setAudioDuration(Math.round(audio.duration))
            console.log('duration',audioDuration)
      // Once the metadata is loaded, we can get the duration
        // Duration in seconds
        };
    }
    console.log(responseData);
   
    const aiMessage: Message = {
    id: String(messages.length + 2),
    content: responseData.Response,
    sender: 'ai',
    timestamp: new Date(),
    audioLength: `${audioDuration}"`,
    action: responseData.Action,
    audioURL: audioUrl
    };
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(null);

  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <header className="flex items-center border-b border-gray-700 p-4">
        <img
          src={user.image_url}
          alt={user.name}
          className="w-10 h-10 rounded-full mr-4"
        />
        <div>
          <h1 className="text-xl font-semibold text-black">{user.name}</h1>
        </div>
      </header>

      {/* Chat messages container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
        {isTyping && <TypingIndicator sender={isTyping} />}
      {/* Message input at the bottom */}
      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-700 mt-6">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

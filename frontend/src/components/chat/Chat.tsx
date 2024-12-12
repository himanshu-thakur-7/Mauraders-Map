import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { Message,AIChatResponse } from './types';
import { TypingIndicator } from './TypingIndicator';
import axios, {AxiosResponse} from "axios";

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Severus walks in and closes the door behind him.',
    sender: 'ai',
    timestamp: new Date(),
    action: 'Severus walks in and closes the door behind him.'
  },
  {
    id: '2',
    content: 'what are you doing here',
    sender: 'user',
    timestamp: new Date()
  },
  {
    id: '3',
    content: 'I heard you talking to yourself. Are you okay?',
    sender: 'ai',
    timestamp: new Date(),
    audioLength: '4"',
    action: 'Severus looks worried.'
  },
  {
    id: '4',
    content: "yep I'm just talking to the voices in my head",
    sender: 'user',
    timestamp: new Date()
  },
  {
    id: '5',
    content: "You know that's not normal, right?",
    sender: 'ai',
    timestamp: new Date(),
    audioLength: '2"',
    action: 'Severus chuckles.'
  }
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState<'user' | 'ai' | null>(null);
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
    
    const response: AxiosResponse = await axios.post('http://localhost:3034/chat',{
        "character":"Severus Snape",
        "Message":content,
        "session":"abcdefgh"
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
          src="assets/Snape.png"
          alt="Severus Snape"
          className="w-10 h-10 rounded-full mr-4"
        />
        <div>
          <h1 className="text-xl font-semibold text-black">Severus Snape</h1>
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

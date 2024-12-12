export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  audioLength?: string;
  timestamp: Date;
  action?: string;
  audioURL?: string 
}

export interface ChatMessageProps {
  message: Message;
}

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export interface AIChatResponse {
    Message: string
    Action: string | undefined
    Response: string
    Audio: string | undefined
}
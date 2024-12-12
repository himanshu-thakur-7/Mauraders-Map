import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { MessageInputProps } from './types';

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-1 bg-white border-gray-200">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Severus Snape"
        className="flex-1 bg-gray-50 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
      />
      <button
        type="submit"
        className="bg-amber-300 text-white p-2 rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
      >
        <Send size={20} />
      </button>
    </form>
  );
}
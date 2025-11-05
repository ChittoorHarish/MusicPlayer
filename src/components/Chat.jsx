import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import useChatStore from '../stores/chatStore';
import {useRoleStore} from '../stores/roleStore';
import useEventStore from '../stores/eventStore';

export default function Chat() {
  const [message, setMessage] = useState('');
  const { messages, addMessage } = useChatStore();
  const { userId, userRole } = useRoleStore();
  const { participants } = useEventStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const user = participants.find(p => p.id === userId);
    addMessage({
      id: Date.now().toString(),
      text: message.trim(),
      userId,
      userName: user?.name || 'Unknown User',
      userRole
    });
    
    setMessage('');
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 h-[400px] flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Chat</h2>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-2">
            <div className={`px-3 py-2 rounded-lg max-w-[80%] ${
              msg.userId === userId 
                ? 'bg-blue-500/20 ml-auto' 
                : 'bg-white/5'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  msg.userRole === 'host' ? 'text-red-500' :
                  msg.userRole === 'subhost' ? 'text-yellow-500' :
                  'text-white/60'
                }`}>
                  {msg.userName}
                </span>
              </div>
              <p className="text-white mt-1">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PaperAirplaneIcon className="w-5 h-5 text-white" />
        </button>
      </form>
    </div>
  );
}
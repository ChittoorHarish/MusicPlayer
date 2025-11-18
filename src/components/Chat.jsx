import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, StarIcon, UserIcon } from '@heroicons/react/24/solid';
import useChatStore from '../stores/chatStore';
import {useRoleStore} from '../stores/roleStore';
import useEventStore from '../stores/eventStore';
import toast from 'react-hot-toast';

export default function Chat() {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, initChatListener } = useChatStore();
  const { userId, userRole } = useRoleStore();
  const { eventData } = useEventStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat listener when event is active
  useEffect(() => {
    if (eventData?.id) {
      console.log('Initializing chat listener for event:', eventData.id);
      const unsubscribe = initChatListener(eventData.id);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [eventData?.id, initChatListener]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!eventData?.id) {
      toast.error('No active event');
      return;
    }

    // Get participant info from eventData.participants
    const participants = eventData?.participants || [];
    const user = participants.find(p => p.id === userId);
    
    console.log('Sending message - userId:', userId, 'found user:', user, 'all participants:', participants);
    
    const messageData = {
      text: message.trim(),
      userId,
      userName: user?.name || 'Unknown User',
      userRole: userRole || 'guest',
    };

    try {
      await sendMessage(eventData.id, messageData);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center text-white/60 py-8">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-lg max-w-[75%] ${
              msg.userId === userId 
                ? 'bg-blue-500/30 border border-blue-500/50' 
                : 'bg-white/10 border border-white/10'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                {msg.userRole === 'host' && (
                  <StarIcon className="w-3.5 h-3.5 text-cyan-400" />
                )}
                {msg.userRole === 'guest' && (
                  <UserIcon className="w-3.5 h-3.5 text-white/50" />
                )}
                <span className={`text-xs font-semibold ${
                  msg.userRole === 'host' ? 'text-cyan-400' :
                  msg.userRole === 'subhost' ? 'text-yellow-400' :
                  'text-white/70'
                }`}>
                  {msg.userName}
                </span>
                {msg.userRole === 'host' && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">HOST</span>
                )}
              </div>
              <p className="text-white text-sm break-words">{msg.text}</p>
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
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="w-5 h-5 text-cyan-400" />
        </button>
      </form>
    </div>
  );
}
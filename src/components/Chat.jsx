import React, { useState, useRef, useEffect } from 'react';import React, { useState, useRef, useEffect } from 'react';

import { PaperAirplaneIcon } from '@heroicons/react/24/solid';import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

import useChatStore from '../stores/chatStore';import useChatStore from '../stores/chatStore';

import {useRoleStore} from '../stores/roleStore';import {useRoleStore} from '../stores/roleStore';

import useEventStore from '../stores/eventStore';import useEventStore from '../stores/eventStore';



export default function Chat() {export default function Chat() {

  const [message, setMessage] = useState('');  const [message, setMessage] = useState('');

  const chatRef = useRef(null);  const { messages, addMessage } = useChatStore();

  const { messages, addMessage } = useChatStore();  const { userId, userRole } = useRoleStore();

  const { userRole } = useRoleStore();  const { participants } = useEventStore();

  const { eventData } = useEventStore();  const messagesEndRef = useRef(null);

  

  useEffect(() => {  const scrollToBottom = () => {

    // Scroll to bottom when messages change    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (chatRef.current) {  };

      chatRef.current.scrollTop = chatRef.current.scrollHeight;

    }  useEffect(() => {

  }, [messages]);    scrollToBottom();

  }, [messages]);

  const handleSubmit = (e) => {

    e.preventDefault();  const handleSendMessage = (e) => {

    if (!message.trim()) return;    e.preventDefault();

    if (!message.trim()) return;

    const newMessage = {

      id: Date.now(),    const user = participants.find(p => p.id === userId);

      text: message,    addMessage({

      sender: eventData?.userId,      id: Date.now().toString(),

      role: userRole,      text: message.trim(),

      timestamp: new Date().toISOString()      userId,

    };      userName: user?.name || 'Unknown User',

      userRole

    addMessage(newMessage);    });

    setMessage('');    

  };    setMessage('');

  };

  return (

    <div className="h-full flex flex-col bg-black/20 backdrop-blur-lg rounded-xl">  return (

      {/* Messages */}    <div className="bg-gray-900 rounded-xl p-4 h-[400px] flex flex-col">

      <div       <h2 className="text-xl font-bold text-white mb-4">Chat</h2>

        ref={chatRef}      

        className="flex-1 overflow-y-auto p-4 space-y-4"      {/* Messages */}

      >      <div className="flex-1 overflow-y-auto space-y-4 mb-4">

        {messages.map(msg => (        {messages.map((msg) => (

          <div           <div key={msg.id} className="flex items-start space-x-2">

            key={msg.id}            <div className={`px-3 py-2 rounded-lg max-w-[80%] ${

            className={`flex ${msg.sender === eventData?.userId ? 'justify-end' : 'justify-start'}`}              msg.userId === userId 

          >                ? 'bg-blue-500/20 ml-auto' 

            <div                 : 'bg-white/5'

              className={`            }`}>

                max-w-[70%] rounded-lg px-4 py-2              <div className="flex items-center space-x-2">

                ${msg.sender === eventData?.userId                 <span className={`text-sm font-medium ${

                  ? 'bg-purple-500/20 text-white'                  msg.userRole === 'host' ? 'text-red-500' :

                  : 'bg-white/10 text-white/90'                  msg.userRole === 'subhost' ? 'text-yellow-500' :

                }                  'text-white/60'

              `}                }`}>

            >                  {msg.userName}

              <div className="flex items-center space-x-2">                </span>

                <span className="text-xs text-white/60">              </div>

                  {msg.role === 'host' ? '👑 Host' : msg.role === 'subhost' ? '⭐️ Sub-Host' : 'Guest'}              <p className="text-white mt-1">{msg.text}</p>

                </span>            </div>

              </div>          </div>

              <p>{msg.text}</p>        ))}

              <span className="text-xs text-white/40">        <div ref={messagesEndRef} />

                {new Date(msg.timestamp).toLocaleTimeString()}      </div>

              </span>      

            </div>      {/* Input */}

          </div>      <form onSubmit={handleSendMessage} className="flex space-x-2">

        ))}        <input

      </div>          type="text"

          value={message}

      {/* Input */}          onChange={(e) => setMessage(e.target.value)}

      <form           placeholder="Type a message..."

        onSubmit={handleSubmit}          className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"

        className="p-4 border-t border-white/10"        />

      >        <button

        <div className="flex space-x-2">          type="submit"

          <input          className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"

            type="text"        >

            value={message}          <PaperAirplaneIcon className="w-5 h-5 text-white" />

            onChange={e => setMessage(e.target.value)}        </button>

            placeholder="Type a message..."      </form>

            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"    </div>

          />  );

          <button}
            type="submit"
            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5 text-purple-500" />
          </button>
        </div>
      </form>
    </div>
  );
}
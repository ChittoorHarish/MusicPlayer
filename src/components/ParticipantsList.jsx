import React, { useState, useEffect } from 'react';
import useEventStore from '../stores/eventStore';
import { useRoleStore } from '../stores/roleStore';

export default function ParticipantsList() {
  const participants = useEventStore(state => state.eventData?.participants || []);
  const userRole = useRoleStore(state => state.userRole);
  const [onlineCount, setOnlineCount] = useState(0);

  // Update online count when participants change
  useEffect(() => {
    setOnlineCount(participants.length);
  }, [participants]);

  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Participants ({participants.length})</h3>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/70">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium">
            {onlineCount} online
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        {participants.map((participant) => (
          <div 
            key={participant.id}
            className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">{participant.name}</span>
                <span className="text-white/60 text-xs">
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {participant.role === 'host' ? (
                <div className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <span className="text-purple-300 text-xs font-medium">Host</span>
                </div>
              ):
               <div className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                  <span className="text-purple-300 text-xs font-medium">Guest</span>
                </div>}
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
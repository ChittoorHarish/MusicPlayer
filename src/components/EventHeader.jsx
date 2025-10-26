import React from 'react';
import { StarIcon as CrownIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import useEventStore from '../stores/eventStore';
import { useRoleStore } from '../stores/roleStore';

export default function EventHeader() {
  const eventData = useEventStore(state => state.eventData);
  const userRole = useRoleStore(state => state.userRole);
  const userId = useRoleStore(state => state.userId);

  if (!eventData) return null;

  return (
    <header className="w-full bg-gradient-to-b from-black/60 to-transparent px-6 py-4 flex items-center justify-between backdrop-blur-sm border-b border-gray-800">
      {/* LEFT: Event Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">{eventData?.title}</h1>
      </div>

      {/* RIGHT: Role Info */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center">
          {userRole === 'host' ? (
            <>
              <CrownIcon className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-500 font-medium">Host</span>
            </>
          ) : (
            <>
              <UserIcon className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-purple-500 font-medium">Guest</span>
            </>
          )}
        </div>

        {/* Event Code */}
        <div className="flex items-center">
          <span className="text-gray-400">Event Code:</span>
          <span className="text-white ml-2 font-mono">{eventData?.id}</span>
        </div>
      </div>
    </header>
  );
}

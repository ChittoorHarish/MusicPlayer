import React, { useState } from 'react';
import { SparklesIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { useRoleStore } from '../../stores/roleStore';
import usePlayerStore from '../../stores/playerStore';
import toast from 'react-hot-toast';

const MAESTRO_COMMANDS = {
  '/preset': 'Load a preset playlist',
  '/skip': 'Skip the current song',
  '/vibe': 'Change the mood/vibe',
  '/limit': 'Set guest request limit',
  '/subhost': 'Promote a user to sub-host',
};

const HYPE_COMMANDS = {
  '/skip': 'Vote to skip current song',
  '/request': 'Request a song',
  '/queue': 'View current queue',
  '/vote': 'Participate in polls',
};

export function ChatBots() {
  const [selectedBot, setSelectedBot] = useState(null);
  const [input, setInput] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const { userRole } = useRoleStore();
  const { skipSong } = usePlayerStore();

  const handleCommand = async (command, args) => {
    const isHost = userRole === 'host';
    const isSubHost = userRole === 'subhost';

    switch (command.toLowerCase()) {
      case '/skip':
        if (isHost || isSubHost) {
          await skipSong();
          return 'Skipping current track...';
        } else {
          // Implement vote skip logic
          return 'Vote to skip registered...';
        }

      case '/preset':
        if (!isHost) return 'Only hosts can load presets.';
        // Implement preset loading
        return `Loading preset playlist: ${args}...`;

      case '/vibe':
        if (!isHost) return 'Only hosts can change the vibe.';
        // Implement vibe change
        return `Changing vibe to: ${args}...`;

      case '/request':
        // Implement song request
        return 'Processing song request...';

      case '/queue':
        // Implement queue view
        return 'Fetching queue...';

      default:
        return 'Unknown command. Try /help for available commands.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = input.trim();
    setInput('');

    if (message.startsWith('/')) {
      const [command, ...args] = message.split(' ');
      const response = await handleCommand(command, args.join(' '));
      toast(response);
    } else {
      // Regular chat message
      toast.success('Message sent!');
    }
  };

  return (
    <div className="fixed bottom-24 right-4 flex flex-col items-end space-y-2">
      {/* Bot Selection */}
      <div className="flex space-x-2">
        {userRole === 'host' && (
          <button
            onClick={() => {
              setSelectedBot(selectedBot === 'maestro' ? null : 'maestro');
              setShowCommands(false);
            }}
            className={`p-3 rounded-full transition-colors ${
              selectedBot === 'maestro'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <MusicalNoteIcon className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={() => {
            setSelectedBot(selectedBot === 'hype' ? null : 'hype');
            setShowCommands(false);
          }}
          className={`p-3 rounded-full transition-colors ${
            selectedBot === 'hype'
              ? 'bg-pink-600 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <SparklesIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Command Help */}
      {selectedBot && (
        <div className="relative">
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="text-white/60 hover:text-white text-sm"
          >
            {showCommands ? 'Hide Commands' : 'Show Commands'}
          </button>

          {showCommands && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-black/90 backdrop-blur-xl rounded-lg p-4 text-sm">
              <h4 className="font-medium text-white mb-2">
                {selectedBot === 'maestro' ? 'Maestro Commands' : 'Hype Commands'}
              </h4>
              <ul className="space-y-1">
                {Object.entries(
                  selectedBot === 'maestro' ? MAESTRO_COMMANDS : HYPE_COMMANDS
                ).map(([cmd, desc]) => (
                  <li key={cmd} className="flex">
                    <span className="text-cyan-500">{cmd}</span>
                    <span className="text-white/60 ml-2">{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Command Input */}
      {selectedBot && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-2 bg-black/40 backdrop-blur-xl rounded-full p-2"
        >
          <span className="text-2xl px-2">
            {selectedBot === 'maestro' ? '🎭' : '🎪'}
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${
              selectedBot === 'maestro' ? 'Maestro' : 'Hype'
            } something...`}
            className="bg-transparent text-white placeholder-white/40 border-none focus:ring-0 flex-1"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
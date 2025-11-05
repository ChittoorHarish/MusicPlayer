import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useEventStore from '../stores/eventStore';
import { useRoleStore } from '../stores/roleStore';

export default function CreateOrJoinEvent() {
  const [showCreate, setShowCreate] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventCode, setEventCode] = useState('');
  const [userName, setUserName] = useState('');
  const setEventData = useEventStore(state => state.setEventData);
  const { setRole } = useRoleStore();
  const addParticipant = useEventStore(state => state.addParticipant);

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [tempEventData, setTempEventData] = useState(null);
  const [tempUserId, setTempUserId] = useState(null);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventName.trim()) {
      toast.error('Please enter an event name');
      return;
    }

    try {
      // Generate a random 6-character event code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const userId = 'user-' + Math.random().toString(36).substring(2, 9);

      if (!userName.trim()) {
        toast.error('Please enter your name');
        return;
      }

      const eventData = {
        id: code,
        title: eventName.trim(),
        hostId: userId,
        createdAt: Date.now(),
        queue: [],
        settings: {
          voteSkipThreshold: 50,
          guestRequestsEnabled: true,
          requestCooldownMinutes: 25,
        },
        participants: [{
          id: userId,
          name: userName.trim(),
          role: 'host',
          joinedAt: Date.now()
        }]
      };

      // Store temporarily and show modal
      setTempEventData(eventData);
      setTempUserId(userId);
      setGeneratedCode(code);
      setShowCodeModal(true);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleJoinEvent = async (e) => {
    e.preventDefault();
    if (!eventCode.trim()) {
      toast.error('Please enter an event code');
      return;
    }

    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      // Get the event data from Firestore
      const eventRef = doc(db, 'events', eventCode.toUpperCase());
      const eventDoc = await getDoc(eventRef);

      if (!eventDoc.exists()) {
        toast.error('Event not found');
        return;
      }

      const eventData = {
        id: eventDoc.id,
        ...eventDoc.data()
      };

      const userId = 'user-' + Math.random().toString(36).substring(2, 9);
      
      // Add the new participant
      const updatedParticipants = [
        ...(eventData.participants || []),
        {
          id: userId,
          name: userName.trim(),
          role: 'guest',
          joinedAt: Date.now()
        }
      ];

      // Update Firestore with new participant
      await setDoc(eventRef, {
        ...eventData,
        participants: updatedParticipants
      }, { merge: true });

      // Update local state
      setEventData({
        ...eventData,
        participants: updatedParticipants
      });
      setRole('guest', userId);
      toast.success(`Joined ${eventData.title}`);
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Rhythemic DJ</h1>
          <p className="text-gray-400">Create or join a music session</p>
        </div>

        {/* Conditional Rendering */}
        {showCreate ? (
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
                
              />
            </div>
             <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-1">
                Event Name
              </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter event name..."
              className="w-full px-4 py-3 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/60"
            />
            <button
              type="submit"
              className="w-full py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Event
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinEvent} className="space-y-4">
            <div>
              <label htmlFor="joinUserName" className="block text-sm font-medium text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="joinUserName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label htmlFor="eventCode" className="block text-sm font-medium text-gray-300 mb-1">
                Event Code
              </label>
              <input
                type="text"
                id="eventCode"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                placeholder="Enter event code..."
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Join Event
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Create Event Instead
            </button>
          </form>
        )}

        {/* Event Code Modal */}
        {showCodeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Event Created Successfully!</h3>
              <p className="text-white/70 mb-4">Share this code with your guests:</p>

              <div className="bg-black/30 p-4 rounded-lg text-center mb-6">
                <p className="text-3xl font-mono text-blue-400 tracking-wider">{generatedCode}</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    toast.success('Code copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy Code
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Save event to Firebase
                      await setDoc(doc(db, 'events', tempEventData.id), tempEventData);
                      
                      // Update local state
                      setEventData(tempEventData);
                      setRole('host', tempUserId);
                      setShowCodeModal(false);
                      toast.success('Event created successfully!');
                    } catch (error) {
                      console.error('Error saving event:', error);
                      toast.error('Failed to create event');
                    }
                  }}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

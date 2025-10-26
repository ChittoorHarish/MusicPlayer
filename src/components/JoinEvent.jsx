import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useStore from '../store';
import toast from 'react-hot-toast';

export default function JoinEvent() {
  const [eventCode, setEventCode] = useState('');
  const [loading, setLoading] = useState(false);
  const setEventData = useStore(state => state.setEventData);
  const setRole = useStore(state => state.setRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventCode.trim()) {
      toast.error('Please enter an event code');
      return;
    }

    setLoading(true);
    try {
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

      // First set the event data
      console.log('Setting event data:', eventData);
      setEventData(eventData);
      
      // Then set the role
      console.log('Setting role to guest');
      setRole('guest', eventData.id);
      
      // Show welcome toast after a small delay to ensure state updates
      setTimeout(() => {
        console.log('Showing welcome toast');
        toast.success('Welcome to ' + eventData.title);
      }, 100);
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-black/30 backdrop-blur-xl rounded-xl border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Join Event</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Event Code
          </label>
          <input
            type="text"
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter 6-digit code..."
            maxLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Joining...' : 'Join Event'}
        </button>
      </form>
    </div>
  );
}
import React, { useState } from 'react';
import { PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { nanoid } from 'nanoid';
import useStore from '../store';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedEventCode, setGeneratedEventCode] = useState('');
  const [tempEventData, setTempEventData] = useState(null);
  const setEventData = useStore(state => state.setEventData);
  const setRole = useStore(state => state.setRole);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted'); // Debug log

    if (!title.trim()) {
      console.log('Title is empty'); // Debug log
      toast.error('Please enter an event title');
      return;
    }

    setLoading(true);
    console.log('Loading set to true'); // Debug log

    try {
      const eventCode = nanoid(6).toUpperCase();
      console.log('Generated event code:', eventCode); // Debug log

      const eventData = {
        id: eventCode,
        title: title.trim(),
        coverImage,
        createdAt: new Date().toISOString(),
        queue: [],
        settings: {
          guestRequestsEnabled: true,
          voteSkipThreshold: 50,
          explicitFilter: true,
          requestInterval: 25
        }
      };
      console.log('Event data created:', eventData); // Debug log

      console.log('Attempting to save to Firebase...'); // Debug log
      await setDoc(doc(db, 'events', eventCode), eventData);
      console.log('Saved to Firebase successfully');
      
      // Store the event data temporarily
      setTempEventData(eventData);
      
      // Show the modal with the event code
      setGeneratedEventCode(eventCode);
      setShowCodeModal(true);
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Detailed error:', error.message, error.code); // More detailed error logging
      toast.error('Failed to create event: ' + error.message);
    } finally {
      setLoading(false);
      console.log('Loading set to false'); // Debug log
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-black/30 backdrop-blur-xl rounded-xl border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Event</h2>
      
      {/* Event Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl border border-white/10 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Event Created Successfully!</h3>
            <p className="text-white/70 mb-4">Share this code with your guests:</p>
            <div className="bg-white/5 p-4 rounded-lg text-center mb-6">
              <p className="text-3xl font-mono text-purple-400 tracking-wider">{generatedEventCode}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedEventCode);
                  toast.success('Code copied to clipboard!');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 mr-2"
              >
                Copy Code
              </button>
              <button
                onClick={() => {
                  // First set the event data
                  console.log('Setting event data:', tempEventData);
                  setEventData(tempEventData);
                  
                  // Then set the role
                  console.log('Setting role to host');
                  setRole('host', tempEventData.id);
                  
                  // Small delay to ensure state updates are processed
                  setTimeout(() => {
                    console.log('Closing modal');
                    setShowCodeModal(false);
                  }, 100);
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter event title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Cover Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/10 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {coverImage ? (
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 rounded-full p-1"
                  >
                    <span className="sr-only">Remove image</span>
                    <PlusIcon className="h-4 w-4 text-white rotate-45" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-white/40" />
                  <div className="flex text-sm text-white/60">
                    <label className="relative cursor-pointer rounded-md font-medium text-purple-400 hover:text-purple-300">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
import React from 'react';
import { UserGroupIcon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import useStore from '../store';
import {useRoleStore} from '../stores/roleStore';
import toast from 'react-hot-toast';

export default function HostControls() {
  const [showSettings, setShowSettings] = React.useState(false);
  const userRole = useRoleStore(state => state.userRole);
  const { eventData, setEventData } = useStore();

  if (userRole !== 'host') return null;

  const handleEndEvent = () => {
    if (window.confirm('Are you sure you want to end this event?')) {
      // Clear event data and navigate to home
      setEventData(null);
      toast.success('Event ended');
    }
  };

  const handlePromoteToSubHost = (userId) => {
    // Implement sub-host promotion logic
    toast.success('User promoted to Sub-Host');
  };

  const handleRemoveGuest = (userId) => {
    // Implement guest removal logic
    toast.success('Guest removed');
  };

  const handleUpdateSettings = (newSettings) => {
    setEventData({
      ...eventData,
      settings: {
        ...eventData.settings,
        ...newSettings
      }
    });
    toast.success('Settings updated');
  };

  return (
    <div className="fixed top-4 right-4 flex items-center space-x-4">
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-full"
      >
        <Cog6ToothIcon className="w-6 h-6 text-white" />
      </button>

      {/* Guest Management */}
      <button
        onClick={() => setShowSettings(true)}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-full"
      >
        <UserGroupIcon className="w-6 h-6 text-white" />
      </button>

      {/* End Event */}
      <button
        onClick={handleEndEvent}
        className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full"
      >
        <XMarkIcon className="w-6 h-6 text-red-500" />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Event Settings</h2>
            
            {/* Settings Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Vote Skip Threshold (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={eventData.settings.voteSkipThreshold}
                  onChange={(e) => handleUpdateSettings({
                    voteSkipThreshold: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Guest Song Requests
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={eventData.settings.guestRequestsEnabled}
                    onChange={(e) => handleUpdateSettings({
                      guestRequestsEnabled: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
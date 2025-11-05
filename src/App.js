import React from 'react';
import { Toaster } from 'react-hot-toast';
import { initializeStores } from './utils/storeUtils';
import setupLocalSync from './services/localSync';
import { setupParticipantSync } from './services/participantSync';
import EventHeader from './components/EventHeader';
import Player from './components/Player';
import RotatingDeck from './components/RotatingDeck';
import WaveOrb from './components/WaveOrb';
import DiscoWaveOrb from './components/DiscoWaveOrb';
import SearchBar from './components/SearchBar';
import FloatingDock from './components/player/FloatingDock';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import useEventStore from './stores/eventStore';
import useQueueStore from './stores/queueStore';
import { useRoleStore } from './stores/roleStore';
import usePlayerStore from './stores/playerStore';
import CreateOrJoinEvent from './components/CreateOrJoinEvent';
import SidePanel from './components/SidePanel';
import './App.css';

function App() {
  const eventData = useEventStore(state => state.eventData);
  const addToQueue = useQueueStore(state => state.addToQueue);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const currentSong = usePlayerStore(state => state.currentSong);
  const setCurrentSong = usePlayerStore(state => state.setCurrentSong);
  const userRole = useRoleStore(state => state.userRole);

  // ✅ Initialize stores only once — prevents infinite re-render loop
  React.useEffect(() => {
    if (!eventData) {
      initializeStores();
    } else {
      // Set up local sync after event is initialized
      const updateLocalState = setupLocalSync();
      usePlayerStore.setState({ updateLocalState });

      // Set up real-time participant sync
      const unsubscribeParticipants = setupParticipantSync(eventData.id);

      // Cleanup when component unmounts or event changes
      return () => {
        if (unsubscribeParticipants) {
          unsubscribeParticipants();
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventData]); // Run when eventData changes

  // If no event, show join/create screen
  if (!eventData) return <CreateOrJoinEvent />;

  // Handle song selection from search results
  const handleVideoSelect = (video) => {
    const songToAdd = { ...video, addedBy: eventData?.userId };
    const queue = useQueueStore.getState().queue;
    
    // Add to queue in all cases
    addToQueue(songToAdd);

    // Only play immediately if there's no current song playing
    // This ensures only the first selected song starts playing
    if (!currentSong) {
      setCurrentSong(songToAdd);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="pr-80">
        <Toaster position="top-center" />

        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b">
          <EventHeader />
        </div>

        {/* Main Layout */}
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Section */}
            <div className="lg:col-span-2 space-y-6">
              <SearchBar onResultSelect={handleVideoSelect} />
              <AnalyticsDashboard eventId={eventData?.id} />
            </div>

            {/* Right Section */}
            <div>
              <div className="relative flex flex-col items-center justify-center p-8 overflow-visible w-[350px] h-[350px]">
                {/* Rotating Deck */}
                <RotatingDeck playing={isPlaying} size={350} />

                {/* Wave Orb at Center */}
                {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <WaveOrb
                    color="#00D8C6"
                    size={160}
                    pulse={isPlaying ? 1.0 : 0}
                    label={currentSong?.title || 'No track playing'}
                  />
                </div> */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
  <DiscoWaveOrb isPlaying={isPlaying} currentSong={currentSong} />
</div>
              </div>
            </div>
          </div>
        </div>
          {/* <div className="sticky bottom-0">
           <Player />
          <FloatingDock />
        </div> */}

        {/* Bottom Player */}
       
        <div className="fixed bottom-0 left-0 right-80 z-10">
          <Player />
          <FloatingDock />
        </div>
        
      </div>

      {/* Side Panel */}
      <SidePanel />
    </div>
    
  );
}

export default App;
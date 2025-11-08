import React from "react";
import { Toaster } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { initializeStores } from "./utils/storeUtils";
import setupLocalSync from "./services/localSync";
import { setupParticipantSync } from "./services/participantSync";
import EventHeader from "./components/EventHeader";
import Player from "./components/Player";
import RotatingDeck from "./components/RotatingDeck";
import DiscoWaveOrb from "./components/DiscoWaveOrb";
import SearchBar from "./components/SearchBar";
import FloatingDock from "./components/player/FloatingDock";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import useEventStore from "./stores/eventStore";
import useQueueStore from "./stores/queueStore";
import { useRoleStore } from "./stores/roleStore";
import usePlayerStore from "./stores/playerStore";
import CreateOrJoinEvent from "./components/CreateOrJoinEvent";
import SidePanel from "./components/SidePanel";
import "./App.css";

function App() {
  const eventData = useEventStore((state) => state.eventData);
  const addToQueue = useQueueStore((state) => state.addToQueue);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentSong = usePlayerStore((state) => state.currentSong);
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const { role, userId } = useRoleStore();

  React.useEffect(() => {
    if (!eventData) {
      initializeStores();
    } else {
      const updateLocalState = setupLocalSync();
      usePlayerStore.setState({ updateLocalState });
      const unsubscribeParticipants = setupParticipantSync(eventData.id);
      return () => unsubscribeParticipants && unsubscribeParticipants();
    }
  }, [eventData]);

  if (!eventData) return <CreateOrJoinEvent />;

  const handleVideoSelect = (video) => {
    const addedBy = role === "host" ? "host" : "guest";
    const songToAdd = {
      ...video,
      addedBy,
      addedById: userId,
      addedAt: Date.now(),
    };

    addToQueue(songToAdd, addedBy);
    if (!currentSong) setCurrentSong(songToAdd);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden">
      <div className="xl:pr-80 transition-all duration-300">
        <Toaster position="top-center" />

        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-b from-gray-900 to-black">
          <EventHeader />
        </div>

        {/* Main Layout */}
        <div className="container mx-auto px-4 py-4 md:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-1">
              <SearchBar onResultSelect={handleVideoSelect} />
              <AnalyticsDashboard eventId={eventData?.id} />
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative flex flex-col items-center justify-center p-4 md:p-8 overflow-visible">
                <div className="w-full max-w-[350px] aspect-square mx-auto">
                  <RotatingDeck playing={isPlaying} size="100%" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[160px]">
                    <DiscoWaveOrb isPlaying={isPlaying} currentSong={currentSong} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Player */}
        <div className="fixed bottom-0 inset-x-0 z-10 xl:right-80 pb-[env(safe-area-inset-bottom)]">
          <Player />
          <FloatingDock />
        </div>
      </div>

      {/* Desktop Side Panel */}
      <div className="hidden xl:block">
        <SidePanel />
      </div>

      {/* ✅ Mobile & Tablet Side Panel */}
      <div className="xl:hidden fixed top-0 right-0 bottom-0 w-full max-w-[320px] transform translate-x-full transition-transform duration-300 z-[100] mobile-side-panel bg-gray-900/95 backdrop-blur-lg flex flex-col">
        {/* Main content with overflow */}
        <div className="flex-1 overflow-y-auto">
          <SidePanel isMobile={true} />
        </div>

        {/* Sticky bottom close button */}
        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent">
          <button
            className="w-full py-3 px-6 bg-white/10 hover:bg-white/15 active:bg-white/20 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-center gap-2 backdrop-blur-sm"
            onClick={() => {
              const panel = document.querySelector(".mobile-side-panel");
              panel?.classList.add("translate-x-full");
            }}
            aria-label="Close Menu"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Close</span>
          </button>
        </div>
        
        <div className="h-[env(safe-area-inset-bottom)] bg-gray-900" />
      </div>
    </div>
  );
}

export default App;

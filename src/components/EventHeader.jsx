import React from "react";
import { StarIcon as CrownIcon } from "@heroicons/react/24/solid";
import { UserIcon, Bars3Icon as MenuIcon } from "@heroicons/react/24/outline";
import useEventStore from "../stores/eventStore";
import { useRoleStore } from "../stores/roleStore";

export default function EventHeader() {
  const eventData = useEventStore((state) => state.eventData);
  const userRole = useRoleStore((state) => state.userRole);

  if (!eventData) return null;

  const handleOpenMenu = () => {
    document.querySelector(".mobile-side-panel")?.classList.remove("translate-x-full");
  };

  return (
    <header className="relative w-full bg-gradient-to-b from-black/60 to-transparent px-6 py-4 backdrop-blur-sm border-b border-gray-800">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between">
        {/* Left Side: Event Title + Mobile/Tablet Role & Code */}
        <div className="flex-1 min-w-0">
          {/* Event Title */}
          <h1 className="text-2xl font-bold text-white truncate pr-16 xl:pr-20">
            {eventData?.title}
          </h1>
          
          {/* Mobile & Tablet: Role & Event Code */}
          <div className="xl:hidden mt-2 flex items-center space-x-4 text-sm">
            {/* Role Info */}
            <div className="flex items-center">
              {userRole === "host" ? (
                <>
                  <CrownIcon className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-500 font-medium">Host</span>
                </>
              ) : (
                <>
                  <UserIcon className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-500 font-medium">Guest</span>
                </>
              )}
            </div>
            
            {/* Event Code */}
            <div className="flex items-center">
              <span className="text-gray-400">Code:</span>
              <span className="text-white ml-1 font-mono">{eventData?.id}</span>
            </div>
          </div>
        </div>

        {/* Desktop: Role Info & Event Code */}
        <div className="hidden xl:flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            {userRole === "host" ? (
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

          <div className="flex items-center">
            <span className="text-gray-400">Code:</span>
            <span className="text-white ml-1 font-mono">{eventData?.id}</span>
          </div>
        </div>
      </div>

      {/* ✅ MOBILE/TABLET MENU ICON */}
      <button
        className="absolute right-4 top-6 sm:top-1/2 sm:-translate-y-1/2 xl:hidden bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
        onClick={handleOpenMenu}
        aria-label="Open Menu"
      >
        <MenuIcon className="w-6 h-6 text-white" />
      </button>
    </header>
  );
}

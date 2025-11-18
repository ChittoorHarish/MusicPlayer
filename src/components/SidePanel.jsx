// src/components/SidePanel.jsx
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import {
  ChatBubbleLeftIcon,
  QueueListIcon,
  HeartIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import useEventStore from "../stores/eventStore";
import useQueueStore from "../stores/queueStore";
import { useRoleStore } from "../stores/roleStore";
import usePlayerStore from "../stores/playerStore";
import useReactionStore from "../stores/reactionStore";
import Chat from "./Chat";

const tabs = [
  { id: "queue", icon: QueueListIcon, label: "Queue" },
  { id: "chat", icon: ChatBubbleLeftIcon, label: "Chat" },
  { id: "reactions", icon: HeartIcon, label: "Reactions" },
  { id: "bots", icon: SparklesIcon, label: "Bots" },
  { id: "settings", icon: Cog6ToothIcon, label: "Settings" },
];

export default function SidePanel() {
  const [activeTab, setActiveTab] = React.useState("queue");

  // Event and settings
  const eventData = useEventStore((state) => state.eventData);
  const updateSettings = useEventStore((state) => state.updateSettings);

  // Queue management
  const queue = useQueueStore((state) => state.queue);
  const moveItem = useQueueStore((state) => state.moveItem);
  const removeItem = useQueueStore((state) => state.removeItem);
  const initQueueListener = useQueueStore((state) => state.initQueueListener);

  // Player management
  const setCurrentSong = usePlayerStore((state) => state.setCurrentSong);
  const currentSong = usePlayerStore((state) => state.currentSong);

  // Reaction management (fixed)
  const currentSongReactions = useReactionStore(
    (state) => state.currentSongReactions || {}
  );
  const addReaction = useReactionStore((state) => state.addReaction);
  const initReactionsListener = useReactionStore(
    (state) => state.initReactionsListener
  );
  const clearCurrentReactions = useReactionStore(
    (state) => state.clearCurrentReactions
  );

  // Role check
  const userRole = useRoleStore((state) => state.userRole);
  const userId = useRoleStore((state) => state.userId);
  const isHost = userRole === "host";

  // Sync queue on event join
  useEffect(() => {
    if (eventData?.id) {
      initQueueListener(eventData.id);
    }
  }, [eventData?.id, initQueueListener]);

  // Sync reactions when song changes
  useEffect(() => {
    if (eventData?.id && currentSong?.id) {
      clearCurrentReactions();
      const unsubscribe = initReactionsListener(eventData.id, currentSong.id);
      return () => unsubscribe && unsubscribe();
    }
  }, [
    eventData?.id,
    currentSong?.id,
    initReactionsListener,
    clearCurrentReactions,
  ]);

  // Settings
  const settings = eventData?.settings || {
    guestRequestsEnabled: true,
    voteSkipThreshold: 50,
    explicitFilter: true,
    requestInterval: 25,
  };

  const renderContent = () => {
    switch (activeTab) {
      case "queue":
        return (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {queue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className="flex items-center bg-white/5 p-2 rounded-lg group hover:bg-white/10 gap-2"
              >
                <span className="text-white/60 w-5 text-center shrink-0">
                  {index + 1}
                </span>
                <div
                  className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                  onClick={(e) => {
                    if (e.target.closest("button")) return;

                    if (!userRole || userRole === "guest") {
                      toast("🎵 Your song will be played by the host soon!", {
                        icon: "⏳",
                        style: {
                          borderRadius: "10px",
                          background: "#333",
                          color: "#fff",
                        },
                      });
                      return;
                    }

                    setCurrentSong(song);
                  }}
                >
                  <img
                    src={song.thumbnail}
                    alt=""
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{song.title}</p>
                    <p className="text-white/60 text-xs truncate">
                      Added by {song.addedBy === "host" ? "Host" : "Guest"}
                    </p>
                  </div>
                </div>
                {isHost && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveItem(index, index - 1);
                      }}
                      disabled={index === 0}
                      className="hover:bg-white/10 rounded disabled:opacity-50 w-6 h-6 flex items-center justify-center"
                    >
                      <ArrowUpIcon className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveItem(index, index + 1);
                      }}
                      disabled={index === queue.length - 1}
                      className="hover:bg-white/10 rounded disabled:opacity-50 w-6 h-6 flex items-center justify-center"
                    >
                      <ArrowDownIcon className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(index);
                      }}
                      className="hover:bg-white/10 rounded text-red-400 w-6 h-6 flex items-center justify-center"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {queue.length === 0 && (
              <div className="text-center text-white/60 py-8">
                No songs in queue
              </div>
            )}
          </div>
        );

      case "chat":
        return (
          <div className="flex-1 overflow-hidden flex flex-col">
            <Chat />
          </div>
        );

      case "reactions":
        const handleReactionClick = async (emoji) => {
          if (!currentSong) {
            toast.error("No song is currently playing!");
            return;
          }

          await addReaction(eventData.id, currentSong.id, emoji, userId);
          toast.success(`${emoji} reaction added!`, {
            duration: 1000,
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          });
        };

        return (
          <div className="flex-1 overflow-y-auto p-4">
            {currentSong && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white/60 text-sm mb-1">Reacting to:</p>
                <p className="text-white font-medium text-sm truncate">
                  {currentSong.title}
                </p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              {["👍", "❤️", "🔥", "😂", "🎵", "🎉"].map((emoji) => {
                const reactionData = currentSongReactions?.[emoji] || {
                  count: 0,
                  users: [],
                };
                const count = reactionData.count || 0;
                const hasReacted = reactionData.users?.includes(userId);

                return (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    disabled={hasReacted}
                    className={`bg-white/5 p-4 rounded-lg text-center transition-all transform ${
                      hasReacted
                        ? "bg-cyan-500/20 border-2 border-cyan-500 cursor-not-allowed"
                        : "hover:bg-white/10 hover:scale-105"
                    }`}
                  >
                    <span className="text-4xl block mb-2">{emoji}</span>
                    <span className="text-white text-sm font-medium">{count}</span>
                  </button>
                );
              })}
            </div>
            {!currentSong && (
              <p className="text-white/60 text-center mt-8">
                Play a song to start reacting!
              </p>
            )}
          </div>
        );

      case "bots":
        return (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isHost ? (
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">DJ Assistant</h3>
                    <button className="px-3 py-1 bg-purple-600 rounded-full text-sm">
                      Enable
                    </button>
                  </div>
                  <p className="text-white/60 text-sm">
                    AI-powered music recommendations based on the crowd's taste
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Mood Matcher</h3>
                    <button className="px-3 py-1 bg-purple-600 rounded-full text-sm">
                      Enable
                    </button>
                  </div>
                  <p className="text-white/60 text-sm">
                    Analyzes chat and reactions to suggest fitting tracks
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 py-8">
                Only hosts can manage bots
              </div>
            )}
          </div>
        );

      case "settings":
        return isHost ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <label className="text-white font-medium block mb-2">
                Explicit Filter
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.explicitFilter}
                  onChange={(e) =>
                    updateSettings({ explicitFilter: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/60">Only hosts can access settings</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-black/50 backdrop-blur-xl border-l border-white/10 flex flex-col h-screen fixed right-0 top-0">
      <div className="flex flex-wrap border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-white bg-white/10"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}

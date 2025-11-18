import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import ParticipantsList from '../ParticipantsList';
import useReactionStore from '../../stores/reactionStore';
import usePlayerStore from '../../stores/playerStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard({ eventId }) {
  const containerRef = React.useRef(null);

  const currentSongReactions = useReactionStore(state => state.currentSongReactions);
  const currentSong = usePlayerStore(state => state.currentSong);

  // Add bottom padding for floating dock
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.paddingBottom = '100px';
    }
  }, []);

  const [stats, setStats] = React.useState({
    playCount: [],
    skipCount: [],
    reactions: [],
    chatActivity: [],
    guestEngagement: { active: 0, passive: 0 },
  });

  // Live reactions from store
  const liveReactions = React.useMemo(() => {
    const emojis = ['👍', '❤️', '🔥', '😂', '🎵', '🎉'];

    if (!currentSongReactions) {
      return emojis.map(emoji => ({ name: emoji, count: 0 }));
    }

    return emojis.map(emoji => ({
      name: emoji,
      count: currentSongReactions[emoji]?.count || 0,
    }));
  }, [currentSongReactions]);

  // Mocked analytics until Firebase implementation
  React.useEffect(() => {
    const mockData = {
      playCount: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)),
      skipCount: Array.from({ length: 24 }, () => Math.floor(Math.random() * 20)),
      reactions: [
        { name: '👍', count: 145 },
        { name: '🔥', count: 89 },
        { name: '😂', count: 34 },
        { name: '💃', count: 67 },
        { name: '👎', count: 12 },
      ],
      chatActivity: Array.from({ length: 24 }, () => Math.floor(Math.random() * 50)),
      guestEngagement: { active: 75, passive: 25 },
    };

    setStats(mockData);
  }, [eventId]);

  const playCountData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Plays per Hour',
        data: stats.playCount,
        borderColor: 'rgb(0, 216, 198)',
        backgroundColor: 'rgba(0, 216, 198, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const reactionData = {
    labels: liveReactions.map(r => r.name),
    datasets: [
      {
        label: 'Reactions',
        data: liveReactions.map(r => r.count),
        backgroundColor: [
          'rgba(0, 216, 198, 0.8)',
          'rgba(155, 125, 255, 0.8)',
          'rgba(255, 125, 155, 0.8)',
          'rgba(125, 255, 155, 0.8)',
          'rgba(255, 155, 125, 0.8)',
          'rgba(255, 215, 0, 0.8)',
        ],
      },
    ],
  };

  return (
    <div
      ref={containerRef}
      className="space-y-6 p-4 pb-32 overflow-y-auto max-h-screen"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Event Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-0">

        {/* Reactions Chart */}
        <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-lg font-medium text-white mb-4">
            Reactions{' '}
           {currentSong && (
  <span className="text-sm text-white/60 whitespace-nowrap truncate max-w-[150px] inline-block align-middle">
    for "{currentSong.title}"
  </span>
            )}
          </h3>

          {liveReactions.some(r => r.count > 0) ? (
            <Bar
              data={reactionData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.6)', stepSize: 1 },
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.6)',
                      font: { size: 20 },
                    },
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.parsed.y} reaction${
                          context.parsed.y !== 1 ? 's' : ''
                        }`;
                      },
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="text-white/60 py-8 text-center">
              {currentSong
                ? 'No reactions yet. Be the first to react!'
                : 'Play a song to see reactions'}
            </div>
          )}
        </div>

        {/* Guest Engagement */}
        <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 max-h-64 overflow-y-auto scrollbar-hide">
          <ParticipantsList />
        </div>
      </div>
    </div>
  );
}

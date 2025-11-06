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

  // Add padding to the bottom when floating dock appears
  React.useEffect(() => {
    const adjustPadding = () => {
      if (containerRef.current) {
        containerRef.current.style.paddingBottom = '100px';
      }
    };
    adjustPadding();
  }, []);
  const [stats, setStats] = React.useState({
    playCount: [],
    skipCount: [],
    reactions: [],
    chatActivity: [],
    guestEngagement: { active: 0, passive: 0 },
  });

  React.useEffect(() => {
    // TODO: Implement real-time analytics using Firebase
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
    labels: stats.reactions.map(r => r.name),
    datasets: [
      {
        label: 'Reactions',
        data: stats.reactions.map(r => r.count),
        backgroundColor: [
          'rgba(0, 216, 198, 0.8)',
          'rgba(155, 125, 255, 0.8)',
          'rgba(255, 125, 155, 0.8)',
          'rgba(125, 255, 155, 0.8)',
          'rgba(255, 155, 125, 0.8)',
        ],
      },
    ],
  };

  return (
    <div ref={containerRef} className="space-y-6 p-4 pb-32 overflow-y-auto max-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Event Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-0">
        {/* Play Count Graph */}
      {/*  <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-lg font-medium text-white mb-4">Play Activity</h3>
          <Line
            data={playCountData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                  ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                },
                x: {
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                  ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                },
              },
              plugins: {
                legend: {
                  labels: { color: 'rgba(255, 255, 255, 0.8)' },
                },
              },
            }}
          />
        </div>*/}

        {/* Reactions Chart */}
        <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-lg font-medium text-white mb-4">Reactions</h3>
          <Bar
            data={reactionData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                  ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: { color: 'rgba(255, 255, 255, 0.6)' },
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>

        {/* Guest Engagement */}
      <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4 max-h-64 overflow-y-auto scrollbar-hide">
  <ParticipantsList />
</div>


        {/* Top Stats */}
      {/*  <div className="bg-black/20 backdrop-blur-xl rounded-xl p-4">
          <h3 className="text-lg font-medium text-white mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/60">Total Plays</p>
              <p className="text-2xl font-bold text-cyan-500">
                {stats.playCount.reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div>
              <p className="text-white/60">Skip Rate</p>
              <p className="text-2xl font-bold text-purple-500">
                {Math.round(
                  (stats.skipCount.reduce((a, b) => a + b, 0) /
                    stats.playCount.reduce((a, b) => a + b, 0)) *
                    100
                )}%
              </p>
            </div>
            <div>
              <p className="text-white/60">Total Reactions</p>
              <p className="text-2xl font-bold text-cyan-500">
                {stats.reactions.reduce((a, b) => a + b.count, 0)}
              </p>
            </div>
            <div>
              <p className="text-white/60">Messages/Hour</p>
              <p className="text-2xl font-bold text-purple-500">
                {Math.round(
                  stats.chatActivity.reduce((a, b) => a + b, 0) / stats.chatActivity.length
                )}
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
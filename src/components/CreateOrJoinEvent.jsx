import React, { useState, useEffect } from 'react';
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
  const { setRole } = useRoleStore(); // ✅ Use role store
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [tempEventData, setTempEventData] = useState(null);
  const [tempUserId, setTempUserId] = useState(null);

  /** ------------------------------
   *  CREATE EVENT
   * ------------------------------ */
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventName.trim()) return toast.error('Please enter an event name');
    if (!userName.trim()) return toast.error('Please enter your name');

    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const userId = 'user-' + Math.random().toString(36).substring(2, 9);

      const eventData = {
        id: code,
        title: eventName.trim(),
        hostId: userId,
        createdAt: Date.now(),
        queue: [],
        settings: {
          voteSkipThreshold: 50,
          guestRequestsEnabled: true,
          requestCooldownMinutes: 25
        },
        participants: [
          {
            id: userId,
            name: userName.trim(),
            role: 'host',
            joinedAt: Date.now()
          }
        ]
      };

      setTempEventData(eventData);
      setTempUserId(userId);
      setGeneratedCode(code);
      setShowCodeModal(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create event');
    }
  };

  /** ------------------------------
   *  JOIN EVENT
   * ------------------------------ */
  const handleJoinEvent = async (e) => {
    e.preventDefault();
    if (!eventCode.trim()) return toast.error('Please enter an event code');
    if (!userName.trim()) return toast.error('Please enter your name');

    try {
      const eventRef = doc(db, 'events', eventCode.toUpperCase());
      const eventDoc = await getDoc(eventRef);

      if (!eventDoc.exists()) return toast.error('Event not found');

      const eventData = { id: eventDoc.id, ...eventDoc.data() };
      const userId = 'user-' + Math.random().toString(36).substring(2, 9);

      const updatedParticipants = [
        ...(eventData.participants || []),
        { id: userId, name: userName.trim(), role: 'guest', joinedAt: Date.now() }
      ];

      await setDoc(eventRef, { ...eventData, participants: updatedParticipants }, { merge: true });

      setEventData({ ...eventData, participants: updatedParticipants });

      // ✅ Store role and userId in global store
      setRole('guest', userId);

      toast.success(`Joined ${eventData.title}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to join event');
    }
  };

  /** ------------------------------
   *  LUXURIOUS VISUAL ANIMATIONS
   * ------------------------------ */
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      temp.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 5 + 1,
        speedX: Math.random() * 0.4 - 0.2,
        speedY: Math.random() * 0.6 + 0.2,
        color: `hsla(${180 + Math.random() * 180}, 100%, 70%, 0.7)`,
        blur: Math.random() * 3 + 1
      });
    }
    setParticles(temp);
  }, []);

  useEffect(() => {
    const animate = () => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: (p.x + p.speedX + window.innerWidth) % window.innerWidth,
          y: (p.y - p.speedY < -10 ? window.innerHeight + 10 : p.y - p.speedY)
        }))
      );
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const [ribbons, setRibbons] = useState([]);
  useEffect(() => {
    const temp = [];
    for (let i = 0; i < 25; i++) {
      temp.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        width: Math.random() * 350 + 200,
        speed: Math.random() * 0.4 + 0.2,
        hue: 180 + Math.random() * 180,
        rotate: Math.random() * 360,
        rotateSpeed: Math.random() * 0.15 - 0.075
      });
    }
    setRibbons(temp);
  }, []);

  useEffect(() => {
    const animate = () => {
      setRibbons(prev =>
        prev.map(r => ({
          ...r,
          y: (r.y - r.speed < -200 ? window.innerHeight + 200 : r.y - r.speed),
          rotate: r.rotate + r.rotateSpeed
        }))
      );
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const [rays, setRays] = useState([]);
  useEffect(() => {
    const temp = [];
    for (let i = 0; i < 12; i++) {
      temp.push({
        x: Math.random() * window.innerWidth,
        width: Math.random() * 250 + 250,
        hue: 180 + Math.random() * 180,
        angle: Math.random() * 360,
        speed: Math.random() * 0.2 + 0.05
      });
    }
    setRays(temp);
  }, []);

  useEffect(() => {
    const animate = () => {
      setRays(prev =>
        prev.map(r => ({ ...r, angle: (r.angle + r.speed * 5) % 360 }))
      );
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  /** ------------------------------
   *  UI RENDER
   * ------------------------------ */
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #020617, #05091f, #000000)'
        }}
      />

      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            top: `${p.y}px`,
            left: `${p.x}px`,
            background: p.color,
            filter: `blur(${p.blur}px)`,
            pointerEvents: 'none'
          }}
        />
      ))}

      {ribbons.map((r, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: `${r.width}px`,
            height: '2px',
            top: `${r.y}px`,
            left: `${r.x - r.width / 2}px`,
            background: `linear-gradient(90deg, hsla(${r.hue},100%,60%,0.9), transparent)`,
            transform: `rotate(${r.rotate}deg)`,
            filter: 'blur(0.5px)',
            opacity: 0.9,
            pointerEvents: 'none'
          }}
        />
      ))}

      {rays.map((r, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: `${r.width}px`,
            height: '5px',
            top: 0,
            left: `${r.x - r.width / 2}px`,
            background: `linear-gradient(90deg, hsla(${r.hue},100%,60%,0.5), transparent)`,
            transform: `rotate(${r.angle}deg)`,
            filter: 'blur(6px)',
            opacity: 0.9,
            pointerEvents: 'none'
          }}
        />
      ))}

      <div className="relative max-w-md w-full mx-auto space-y-6 backdrop-blur-md bg-black/30 border border-cyan-400/20 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,255,255,0.3)] z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-2 tracking-wide drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            Welcome to Rhythemic DJ
          </h1>
          <p className="text-gray-300">Create or join a music session</p>
        </div>

        {showCreate ? (
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <input
              type="text"
              placeholder="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-semibold text-white shadow-lg"
            >
              Create Event
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="w-full py-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
            >
              Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinEvent} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <input
              type="text"
              placeholder="Event Code"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-cyan-400/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-semibold text-white shadow-lg"
            >
              Join Event
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="w-full py-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
            >
              Create Event Instead
            </button>
          </form>
        )}

        {showCodeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-black/90 rounded-xl p-6 max-w-sm w-full border border-cyan-400/20 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Event Created Successfully!
              </h3>
              <p className="text-white/70 mb-4">
                Share this code with your guests:
              </p>
              <div className="bg-black/30 p-4 rounded-lg text-center mb-6">
                <p className="text-3xl font-mono text-cyan-400 tracking-wider">
                  {generatedCode}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    toast.success('Code copied!');
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-semibold text-white shadow-lg"
                >
                  Copy Code
                </button>
                <button
                  onClick={async () => {
                    try {
                      await setDoc(doc(db, 'events', tempEventData.id), tempEventData);
                      setEventData(tempEventData);
                      // ✅ store role + userId globally
                      setRole('host', tempUserId);
                      setShowCodeModal(false);
                      toast.success('Event created successfully!');
                    } catch (e) {
                      console.error(e);
                      toast.error('Failed to create event');
                    }
                  }}
                  className="px-4 py-2 bg-black/20 text-white rounded-lg hover:bg-black/30 transition-colors"
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

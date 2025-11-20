// Audio Context Service for DJ Effects
let audioContext = null;
let audioNodes = null;
let sourceNode = null;

/**
 * Initialize Web Audio API context and create effect nodes
 */
export const initializeAudioContext = () => {
  try {
    // Create audio context if not exists
    if (!audioContext || audioContext.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
    }
    
    // Resume context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create audio nodes for effects
    const nodes = createAudioNodes(audioContext);
    audioNodes = nodes;
    
    return { audioContext, nodes };
  } catch (error) {
    console.error('Error initializing audio context:', error);
    return null;
  }
};

/**
 * Create audio effect nodes
 */
const createAudioNodes = (ctx) => {
  try {
    // Create EQ nodes (3-band equalizer using BiquadFilters)
    const bassEQ = ctx.createBiquadFilter();
    bassEQ.type = 'lowshelf';
    bassEQ.frequency.value = 200; // Bass frequencies
    bassEQ.gain.value = 0;
    
    const midEQ = ctx.createBiquadFilter();
    midEQ.type = 'peaking';
    midEQ.frequency.value = 1000; // Mid frequencies
    midEQ.Q.value = 1;
    midEQ.gain.value = 0;
    
    const trebleEQ = ctx.createBiquadFilter();
    trebleEQ.type = 'highshelf';
    trebleEQ.frequency.value = 3000; // Treble frequencies
    trebleEQ.gain.value = 0;
    
    // Create filter node
    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'allpass'; // Default to no filter
    filterNode.frequency.value = 1000;
    filterNode.Q.value = 1;
    
    // Create gain node for overall volume control
    const gainNode = ctx.createGain();
    gainNode.gain.value = 1.0;
    
    // Create analyser for visualization
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    // Pre-connect the effect chain: bassEQ → midEQ → trebleEQ → filter → gain → analyser → destination
    // This allows sounds to be routed through the chain at any time
    bassEQ.connect(midEQ);
    midEQ.connect(trebleEQ);
    trebleEQ.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(ctx.destination);
    
    console.log('DJ effect chain pre-connected and ready');
    
    return {
      bassEQ,
      midEQ,
      trebleEQ,
      filterNode,
      gainNode,
      analyser,
    };
  } catch (error) {
    console.error('Error creating audio nodes:', error);
    return null;
  }
};

/**
 * Connect audio source through effect chain
 */
export const connectAudioSource = (source) => {
  try {
    if (!audioContext || !audioNodes || !source) {
      console.warn('Audio context or nodes not initialized');
      return false;
    }
    
    // Disconnect previous source if exists
    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
    
    sourceNode = source;
    
    // Connect source to the start of the pre-connected effect chain
    source.connect(audioNodes.bassEQ);
    
    console.log('Audio source connected through DJ effect chain');
    return true;
  } catch (error) {
    console.error('Error connecting audio source:', error);
    return false;
  }
};

/**
 * Update EQ settings
 */
export const updateEQ = (band, value) => {
  try {
    if (!audioNodes) return;
    
    // Clamp value between -12 and +12 dB
    const clampedValue = Math.max(-12, Math.min(12, value));
    
    switch (band) {
      case 'bass':
        audioNodes.bassEQ.gain.value = clampedValue;
        break;
      case 'mid':
        audioNodes.midEQ.gain.value = clampedValue;
        break;
      case 'treble':
        audioNodes.trebleEQ.gain.value = clampedValue;
        break;
      default:
        console.warn('Unknown EQ band:', band);
    }
  } catch (error) {
    console.error('Error updating EQ:', error);
  }
};

/**
 * Update filter settings
 */
export const updateFilter = (settings) => {
  try {
    if (!audioNodes || !audioNodes.filterNode) return;
    
    const { type, frequency, q } = settings;
    
    if (type === 'none') {
      audioNodes.filterNode.type = 'allpass';
    } else if (['lowpass', 'highpass', 'bandpass'].includes(type)) {
      audioNodes.filterNode.type = type;
      if (frequency) audioNodes.filterNode.frequency.value = frequency;
      if (q) audioNodes.filterNode.Q.value = q;
    }
  } catch (error) {
    console.error('Error updating filter:', error);
  }
};

/**
 * Generate synthetic sound effect (fallback when MP3 files are missing)
 */
const generateSyntheticSound = (type, ctx) => {
  const sampleRate = ctx.sampleRate;
  let duration, frequency, decay;
  
  switch (type) {
    case 'airhorn':
      duration = 1.0;
      frequency = 400;
      decay = 0.3;
      break;
    case 'scratch':
      duration = 0.5;
      frequency = 100;
      decay = 0.1;
      break;
    case 'drop':
      duration = 0.8;
      frequency = 60;
      decay = 0.5;
      break;
    default:
      duration = 0.5;
      frequency = 440;
      decay = 0.3;
  }
  
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    let value = 0;
    
    if (type === 'airhorn') {
      // Aggressive horn sound with harmonics
      value = Math.sin(2 * Math.PI * frequency * t) * 0.6 +
              Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.3 +
              Math.sin(2 * Math.PI * frequency * 2 * t) * 0.1;
      value *= Math.exp(-decay * t);
    } else if (type === 'scratch') {
      // Scratchy noise with rapid frequency change
      const freqMod = frequency + (Math.random() * 200 - 100);
      value = (Math.random() * 2 - 1) * 0.5 + Math.sin(2 * Math.PI * freqMod * t) * 0.5;
      value *= Math.exp(-decay * t * 10);
    } else if (type === 'drop') {
      // Bass drop with frequency sweep
      const sweepFreq = frequency + (200 * Math.exp(-t * 5));
      value = Math.sin(2 * Math.PI * sweepFreq * t) * 0.8;
      value *= Math.max(0, 1 - t / duration);
    }
    
    data[i] = value;
  }
  
  return buffer;
};

/**
 * Play DJ sound effect
 */
export const playDJSound = async (soundUrl, effectType = 'airhorn') => {
  try {
    console.log(`🎵 playDJSound called with: ${effectType}`);
    
    if (!audioContext) {
      // Initialize if not already
      console.log('Initializing audio context...');
      const result = initializeAudioContext();
      if (!result) {
        console.error('Failed to initialize audio context');
        return;
      }
    }
    
    console.log('Audio context state:', audioContext.state);
    
    // Resume context if needed
    if (audioContext.state === 'suspended') {
      console.log('Resuming suspended audio context...');
      await audioContext.resume();
      console.log('Audio context resumed, new state:', audioContext.state);
    }
    
    let audioBuffer;
    
    try {
      // Try to fetch and decode audio file
      const response = await fetch(soundUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Check if file is empty (< 100 bytes likely empty)
      if (arrayBuffer.byteLength < 100) {
        throw new Error('Audio file is empty');
      }
      
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.log(`MP3 file not available, generating synthetic ${effectType} sound`);
      // Generate synthetic sound as fallback
      audioBuffer = generateSyntheticSound(effectType, audioContext);
    }
    
    console.log('Audio buffer created, duration:', audioBuffer.duration);
    
    // Create buffer source
    const soundSource = audioContext.createBufferSource();
    soundSource.buffer = audioBuffer;
    
    // Create gain for sound effect
    const soundGain = audioContext.createGain();
    soundGain.gain.value = 0.7; // 70% volume for effects
    
    // Connect through EQ chain if available, otherwise direct to destination
    if (audioNodes && audioNodes.bassEQ) {
      // Route through DJ effects: soundSource → soundGain → bassEQ → (rest of chain) → destination
      soundSource.connect(soundGain);
      soundGain.connect(audioNodes.bassEQ);
      // The rest of the chain is already connected: bassEQ → midEQ → trebleEQ → filter → gain → analyser → destination
      console.log('✅ DJ sound routed through EQ/filter chain');
    } else {
      // Direct connection if effects not initialized
      soundSource.connect(soundGain);
      soundGain.connect(audioContext.destination);
      console.log('✅ DJ sound playing without effects (chain not initialized)');
    }
    
    // Play sound
    soundSource.start(0);
    
    console.log(`✅ Playing DJ sound effect: ${effectType}`);
  } catch (error) {
    console.error('❌ Error playing DJ sound:', error);
    throw error;
  }
};

/**
 * Get frequency data for visualization
 */
export const getFrequencyData = () => {
  try {
    if (!audioNodes || !audioNodes.analyser) return null;
    
    const bufferLength = audioNodes.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioNodes.analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  } catch (error) {
    console.error('Error getting frequency data:', error);
    return null;
  }
};

/**
 * Cleanup audio context
 */
export const cleanupAudioContext = () => {
  try {
    // Disconnect source
    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      sourceNode = null;
    }
    
    // Disconnect all nodes
    if (audioNodes) {
      Object.values(audioNodes).forEach(node => {
        try {
          if (node && typeof node.disconnect === 'function') {
            node.disconnect();
          }
        } catch (e) {
          // Ignore disconnect errors
        }
      });
      audioNodes = null;
    }
    
    // Close audio context
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      audioContext = null;
    }
    
    console.log('Audio context cleaned up');
  } catch (error) {
    console.error('Error cleaning up audio context:', error);
  }
};

/**
 * Get current audio context
 */
export const getAudioContext = () => audioContext;

/**
 * Get current audio nodes
 */
export const getAudioNodes = () => audioNodes;

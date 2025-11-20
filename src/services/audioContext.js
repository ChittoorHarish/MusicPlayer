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
    
    // Connect the audio chain: source → bass → mid → treble → filter → gain → analyser → destination
    source.connect(audioNodes.bassEQ);
    audioNodes.bassEQ.connect(audioNodes.midEQ);
    audioNodes.midEQ.connect(audioNodes.trebleEQ);
    audioNodes.trebleEQ.connect(audioNodes.filterNode);
    audioNodes.filterNode.connect(audioNodes.gainNode);
    audioNodes.gainNode.connect(audioNodes.analyser);
    audioNodes.analyser.connect(audioContext.destination);
    
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
 * Play DJ sound effect
 */
export const playDJSound = async (soundUrl) => {
  try {
    if (!audioContext) {
      console.warn('Audio context not initialized');
      return;
    }
    
    // Resume context if needed
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Fetch and decode audio
    const response = await fetch(soundUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create buffer source
    const soundSource = audioContext.createBufferSource();
    soundSource.buffer = audioBuffer;
    
    // Create gain for sound effect
    const soundGain = audioContext.createGain();
    soundGain.gain.value = 0.7; // 70% volume for effects
    
    // Connect: soundSource → soundGain → destination
    soundSource.connect(soundGain);
    soundGain.connect(audioContext.destination);
    
    // Play sound
    soundSource.start(0);
    
    console.log('Playing DJ sound effect');
  } catch (error) {
    console.error('Error playing DJ sound:', error);
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

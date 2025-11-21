// Advanced Audio Effects Engine
// This service applies real-time audio transformations to playing audio

let audioContext = null;
let sourceNode = null;
let effectNodes = {
  bassEQ: null,
  midEQ: null,
  trebleEQ: null,
  compressor: null,
  reverb: null,
  delay: null,
  analyser: null,
  gainNode: null,
  pannerNode: null,
  distortion: null,
  bitcrusher: null
};

let currentSpeed = 1.0;
let currentPitch = 0;
let spatialInterval = null;
let kickDrumInterval = null;
let vinylNoiseNode = null;

/**
 * Initialize audio effects engine
 */
export const initializeAudioEffects = () => {
  try {
    if (!audioContext || audioContext.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
    }
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    createEffectNodes();
    console.log('✅ Audio effects engine initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing audio effects:', error);
    return false;
  }
};

/**
 * Create all effect nodes
 */
const createEffectNodes = () => {
  if (!audioContext) return;
  
  // 3-Band EQ with dramatic ranges
  effectNodes.bassEQ = audioContext.createBiquadFilter();
  effectNodes.bassEQ.type = 'lowshelf';
  effectNodes.bassEQ.frequency.value = 200;
  effectNodes.bassEQ.gain.value = 0;
  
  effectNodes.midEQ = audioContext.createBiquadFilter();
  effectNodes.midEQ.type = 'peaking';
  effectNodes.midEQ.frequency.value = 1000;
  effectNodes.midEQ.Q.value = 1;
  effectNodes.midEQ.gain.value = 0;
  
  effectNodes.trebleEQ = audioContext.createBiquadFilter();
  effectNodes.trebleEQ.type = 'highshelf';
  effectNodes.trebleEQ.frequency.value = 3000;
  effectNodes.trebleEQ.gain.value = 0;
  
  // Distortion for EDM/Bass Boost
  effectNodes.distortion = audioContext.createWaveShaper();
  effectNodes.distortion.curve = makeDistortionCurve(0);
  effectNodes.distortion.oversample = '4x';
  
  // Compressor for better dynamics
  effectNodes.compressor = audioContext.createDynamicsCompressor();
  effectNodes.compressor.threshold.value = -24;
  effectNodes.compressor.knee.value = 30;
  effectNodes.compressor.ratio.value = 12;
  effectNodes.compressor.attack.value = 0.003;
  effectNodes.compressor.release.value = 0.25;
  
  // Delay for echo effect
  effectNodes.delay = audioContext.createDelay(2.0);
  effectNodes.delay.delayTime.value = 0;
  
  // Gain nodes
  effectNodes.gainNode = audioContext.createGain();
  effectNodes.gainNode.gain.value = 1.0;
  
  effectNodes.delayGain = audioContext.createGain();
  effectNodes.delayGain.gain.value = 0;
  
  effectNodes.reverbGain = audioContext.createGain();
  effectNodes.reverbGain.gain.value = 0;
  
  effectNodes.distortionGain = audioContext.createGain();
  effectNodes.distortionGain.gain.value = 0;
  
  // Panner for 8D effect
  effectNodes.pannerNode = audioContext.createStereoPanner();
  effectNodes.pannerNode.pan.value = 0;
  
  // Analyser
  effectNodes.analyser = audioContext.createAnalyser();
  effectNodes.analyser.fftSize = 2048;
  
  console.log('Effect nodes created with enhanced processing');
};

/**
 * Create distortion curve
 */
const makeDistortionCurve = (amount) => {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
};

/**
 * Generate vinyl crackle/noise for lo-fi effect
 */
const generateVinylNoise = () => {
  if (!audioContext) return null;
  
  const bufferSize = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.02;
  }
  
  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  
  const noiseGain = audioContext.createGain();
  noiseGain.gain.value = 0;
  
  noise.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  noise.start(0);
  
  vinylNoiseNode = { source: noise, gain: noiseGain };
  return vinylNoiseNode;
};

/**
 * Generate kick drum for EDM effect
 */
const generateKickDrum = () => {
  if (!audioContext) return;
  
  const osc = audioContext.createOscillator();
  const oscGain = audioContext.createGain();
  
  osc.frequency.setValueAtTime(150, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscGain.gain.setValueAtTime(1, audioContext.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  osc.connect(oscGain);
  oscGain.connect(audioContext.destination);
  
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.5);
};

/**
 * Start EDM kick drum loop
 */
const startEDMKicks = () => {
  if (kickDrumInterval) return;
  
  kickDrumInterval = setInterval(() => {
    generateKickDrum();
  }, 500);
  
  console.log('🔥 EDM kick drums started');
};

const stopEDMKicks = () => {
  if (kickDrumInterval) {
    clearInterval(kickDrumInterval);
    kickDrumInterval = null;
    console.log('EDM kick drums stopped');
  }
};

const createReverbImpulse = (duration, decay) => {
  if (!audioContext) return null;
  
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  
  return impulse;
};

/**
 * Apply audio effects preset
 */
export const applyAudioEffects = (effects, presetId) => {
  try {
    if (!audioContext || !effectNodes.bassEQ) {
      console.log('Initializing audio effects...');
      initializeAudioEffects();
    }
    
    console.log('🎛️ Applying audio effects:', presetId, effects);
    
    // Stop all special effects first
    stop8DAudioEffect();
    stopEDMKicks();
    if (vinylNoiseNode) {
      vinylNoiseNode.gain.gain.value = 0;
    }
    
    // Apply EQ with dramatic values
    if (effectNodes.bassEQ) {
      effectNodes.bassEQ.gain.value = effects.bass || 0;
    }
    if (effectNodes.midEQ) {
      effectNodes.midEQ.gain.value = effects.mid || 0;
    }
    if (effectNodes.trebleEQ) {
      effectNodes.trebleEQ.gain.value = effects.treble || 0;
    }
    
    // Apply distortion for EDM/Bass Boost
    if (effectNodes.distortion && effectNodes.distortionGain) {
      const distortionAmount = effects.distortion || 0;
      if (distortionAmount > 0) {
        effectNodes.distortion.curve = makeDistortionCurve(distortionAmount * 100);
        effectNodes.distortionGain.gain.value = distortionAmount * 0.5;
      } else {
        effectNodes.distortionGain.gain.value = 0;
      }
    }
    
    // Apply delay/echo
    if (effectNodes.delay && effectNodes.delayGain) {
      const echoLevel = effects.echo || 0;
      effectNodes.delay.delayTime.value = echoLevel > 0 ? 0.35 : 0;
      effectNodes.delayGain.gain.value = echoLevel * 0.6;
    }
    
    // Apply reverb
    if (effectNodes.reverbGain) {
      effectNodes.reverbGain.gain.value = (effects.reverb || 0) * 0.8;
      
      if (effects.reverb > 0 && !effectNodes.reverb) {
        effectNodes.reverb = audioContext.createConvolver();
        effectNodes.reverb.buffer = createReverbImpulse(3, 4);
      }
    }
    
    // Preset-specific effects
    if (presetId === 'lofi') {
      if (!vinylNoiseNode) {
        generateVinylNoise();
      }
      if (vinylNoiseNode) {
        vinylNoiseNode.gain.gain.value = 0.08;
      }
    } else if (presetId === 'edm') {
      startEDMKicks();
    } else if (presetId === '8d') {
      start8DAudioEffect();
    }
    
    currentSpeed = effects.speed || 1.0;
    currentPitch = effects.pitch || 0;
    
    console.log('✅ Audio effects applied with preset:', presetId);
    return { speed: currentSpeed, pitch: currentPitch };
  } catch (error) {
    console.error('❌ Error applying audio effects:', error);
    return { speed: 1.0, pitch: 0 };
  }
};

/**
 * Connect audio source to effects chain
 */
export const connectAudioSource = (source) => {
  try {
    console.log('🎛️ audioEffectsEngine: Attempting to connect audio source:', source);
    
    if (!source) {
      console.error('❌ No audio source provided');
      return false;
    }

    // Initialize audio context if needed
    if (!audioContext || audioContext.state === 'closed') {
      console.log('🎛️ Initializing audio context...');
      initializeAudioEffects();
    }
    
    // Resume if suspended (browser autoplay policy)
    if (audioContext && audioContext.state === 'suspended') {
      console.log('🎛️ Resuming suspended audio context...');
      audioContext.resume().then(() => {
        console.log('✅ Audio context resumed');
      });
    }
    
    // Initialize effect nodes if not created
    if (!effectNodes.bassEQ) {
      console.log('🎛️ Creating effect nodes...');
      createEffectNodes();
    }
    
    // Disconnect previous source
    if (sourceNode) {
      try { 
        sourceNode.disconnect(); 
        console.log('🎛️ Disconnected previous source');
      } catch (e) {}
    }
    
    // Create MediaElementSource if source is an HTML audio/video element
    if (source instanceof HTMLMediaElement) {
      console.log('🎛️ Creating MediaElementSource from HTML audio element');
      try {
        sourceNode = audioContext.createMediaElementSource(source);
        console.log('✅ MediaElementSource created successfully');
      } catch (error) {
        // This can fail if element is already connected
        console.error('❌ Failed to create MediaElementSource:', error.message);
        if (error.message.includes('already connected')) {
          console.warn('⚠️ Audio element already has a source node. This is normal on hot reload.');
          return false;
        }
        throw error;
      }
    } else {
      sourceNode = source;
    }
    
    // Build effect chain
    console.log('🎛️ Building effect chain...');
    sourceNode.connect(effectNodes.bassEQ);
    effectNodes.bassEQ.connect(effectNodes.midEQ);
    effectNodes.midEQ.connect(effectNodes.trebleEQ);
    effectNodes.trebleEQ.connect(effectNodes.compressor);
    
    // Parallel distortion
    effectNodes.compressor.connect(effectNodes.distortion);
    effectNodes.distortion.connect(effectNodes.distortionGain);
    effectNodes.distortionGain.connect(effectNodes.gainNode);
    
    // Parallel delay
    effectNodes.compressor.connect(effectNodes.delay);
    effectNodes.delay.connect(effectNodes.delayGain);
    effectNodes.delayGain.connect(effectNodes.gainNode);
    
    // Parallel reverb
    if (effectNodes.reverb) {
      effectNodes.compressor.connect(effectNodes.reverb);
      effectNodes.reverb.connect(effectNodes.reverbGain);
      effectNodes.reverbGain.connect(effectNodes.gainNode);
    }
    
    // Main signal
    effectNodes.compressor.connect(effectNodes.gainNode);
    
    // Panner (8D effect)
    effectNodes.gainNode.connect(effectNodes.pannerNode);
    effectNodes.pannerNode.connect(effectNodes.analyser);
    effectNodes.analyser.connect(audioContext.destination);
    
    console.log('✅ Audio source connected to effects chain successfully');
    console.log('🎛️ Audio context state:', audioContext.state);
    return true;
  } catch (error) {
    console.error('❌ Error connecting audio source:', error);
    console.error('❌ Error stack:', error.stack);
    return false;
  }
};

/**
 * 8D Audio effect - pans audio left/right continuously
 */
const start8DAudioEffect = () => {
  if (spatialInterval) return;
  
  let angle = 0;
  spatialInterval = setInterval(() => {
    if (effectNodes.pannerNode) {
      angle += 0.05;
      const pan = Math.sin(angle);
      effectNodes.pannerNode.pan.value = pan;
    }
  }, 50);
  
  console.log('🎧 8D Audio effect started');
};

const stop8DAudioEffect = () => {
  if (spatialInterval) {
    clearInterval(spatialInterval);
    spatialInterval = null;
    if (effectNodes.pannerNode) {
      effectNodes.pannerNode.pan.value = 0;
    }
    console.log('8D Audio effect stopped');
  }
};

/**
 * Get current playback speed and pitch shift
 */
export const getPlaybackModifications = () => {
  return { speed: currentSpeed, pitch: currentPitch };
};

/**
 * Cleanup
 */
export const cleanupAudioEffects = () => {
  stop8DAudioEffect();
  stopEDMKicks();
  
  if (vinylNoiseNode) {
    try { 
      vinylNoiseNode.source.stop();
      vinylNoiseNode.gain.disconnect();
    } catch (e) {}
    vinylNoiseNode = null;
  }
  
  if (sourceNode) {
    try { sourceNode.disconnect(); } catch (e) {}
    sourceNode = null;
  }
  
  Object.values(effectNodes).forEach(node => {
    if (node) {
      try { node.disconnect(); } catch (e) {}
    }
  });
  
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }
  
  console.log('Audio effects cleaned up');
};

export const getAudioContext = () => audioContext;
export const getEffectNodes = () => effectNodes;

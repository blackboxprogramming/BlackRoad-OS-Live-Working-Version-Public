/**
 * BlackRoad Metaverse - Audio System
 * Procedural ambient music + biome sounds
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.isMusicEnabled = true;
        this.musicLoop = null;
        
        // Musical scales
        this.scales = {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            pentatonic: [0, 2, 4, 7, 9]
        };
        
        this.currentBiome = 'forest';
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.audioContext.destination);
            
            this.isInitialized = true;
            console.log('🎵 Audio System ready');
            return true;
        } catch (error) {
            console.error('Audio init failed:', error);
            return false;
        }
    }
    
    startMusic() {
        if (!this.isInitialized || !this.isMusicEnabled) return;
        
        const scale = this.scales.pentatonic;
        const baseFreq = 220;
        const bpm = 80;
        const noteDuration = 60 / bpm;
        
        let noteIndex = 0;
        
        this.musicLoop = setInterval(() => {
            const scaleNote = scale[noteIndex % scale.length];
            const frequency = baseFreq * Math.pow(2, scaleNote / 12);
            
            this.playTone(frequency, noteDuration * 0.8);
            noteIndex++;
        }, noteDuration * 1000);
    }
    
    playTone(frequency, duration) {
        if (!this.isInitialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.frequency.value = frequency;
        osc.type = 'sine';
        
        const now = this.audioContext.currentTime;
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + duration);
    }
    
    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        
        if (!this.isMusicEnabled && this.musicLoop) {
            clearInterval(this.musicLoop);
            this.musicLoop = null;
        } else if (this.isMusicEnabled) {
            this.startMusic();
        }
        
        return this.isMusicEnabled;
    }
    
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
}

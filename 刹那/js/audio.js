// オーディオ管理クラス
class AudioManager {
    constructor() {
        this.bgmEnabled = true;
        this.seEnabled = true;
        this.audioContext = null;
        this.bgmGain = null;
        this.seGain = null;
        this.bgmSource = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // BGM用ゲインノード
            this.bgmGain = this.audioContext.createGain();
            this.bgmGain.connect(this.audioContext.destination);
            this.bgmGain.gain.value = 0.3;

            // SE用ゲインノード
            this.seGain = this.audioContext.createGain();
            this.seGain.connect(this.audioContext.destination);
            this.seGain.gain.value = 0.5;

            this.initialized = true;
        } catch (e) {
            console.warn('Audio initialization failed:', e);
        }
    }

    // 抜刀音SE
    playSlashSE() {
        if (!this.seEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.seGain);

        // 金属的な斬撃音
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);

        // ノイズ成分を追加
        this.playNoise(0.08, 0.15);
    }

    // 敗北SE
    playDefeatSE() {
        if (!this.seEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.seGain);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // 勝負開始SE
    playStartSE() {
        if (!this.seEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.seGain);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(550, this.audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.25);
    }

    // ホワイトノイズ生成
    playNoise(volume, duration) {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.seGain);

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

        source.start(this.audioContext.currentTime);
    }

    // 和風BGM（シンプルなループ）
    startBGM() {
        if (!this.bgmEnabled || !this.audioContext || this.bgmSource) return;

        this.playAmbientLoop();
    }

    playAmbientLoop() {
        if (!this.bgmEnabled || !this.audioContext) return;

        // 風の音をシミュレート
        const createWindSound = () => {
            const bufferSize = this.audioContext.sampleRate * 4;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                const t = i / this.audioContext.sampleRate;
                // ゆっくり変化するノイズ
                data[i] = (Math.random() * 2 - 1) * 0.1 * (0.5 + 0.5 * Math.sin(t * 0.5));
            }

            return buffer;
        };

        const playWind = () => {
            if (!this.bgmEnabled) return;

            const source = this.audioContext.createBufferSource();
            const filter = this.audioContext.createBiquadFilter();

            source.buffer = createWindSound();
            filter.type = 'lowpass';
            filter.frequency.value = 500;

            source.connect(filter);
            filter.connect(this.bgmGain);

            source.loop = false;
            source.start();

            source.onended = () => {
                if (this.bgmEnabled) {
                    setTimeout(playWind, 100);
                }
            };

            this.bgmSource = source;
        };

        playWind();

        // 和音を時々鳴らす
        this.playJapaneseChord();
    }

    playJapaneseChord() {
        if (!this.bgmEnabled || !this.audioContext) return;

        const pentatonic = [261.63, 293.66, 349.23, 392.00, 523.25]; // 日本風の音階
        const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.bgmGain);

        oscillator.type = 'sine';
        oscillator.frequency.value = note;

        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 2);

        // 次の和音
        if (this.bgmEnabled) {
            setTimeout(() => this.playJapaneseChord(), 3000 + Math.random() * 4000);
        }
    }

    stopBGM() {
        if (this.bgmSource) {
            try {
                this.bgmSource.stop();
            } catch (e) {}
            this.bgmSource = null;
        }
    }

    setBGMEnabled(enabled) {
        this.bgmEnabled = enabled;
        if (enabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
    }

    setSEEnabled(enabled) {
        this.seEnabled = enabled;
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

const audioManager = new AudioManager();

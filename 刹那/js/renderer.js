// 描画エンジン（縦画面対応）
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pixelSize = 4; // 1ドットのサイズ
        this.width = 0;
        this.height = 0;
        this.animationFrame = 0;

        // 画像キャッシュ
        this.imageCache = {};
        this.imageLoadPromises = {};

        // 背景設定（画像パス追加）
        this.backgrounds = [
            { name: 'susuki', skyColor: '#1a1a2e', groundColor: '#2a2020', image: 'assets/images/backgrounds/bg_susuki.png' },
            { name: 'bamboo', skyColor: '#1e2a1e', groundColor: '#1a2818', image: 'assets/images/backgrounds/bg_bamboo.png' },
            { name: 'rain', skyColor: '#1a1a2e', groundColor: '#1a1a28', image: 'assets/images/backgrounds/bg_rain.png' },
            { name: 'snow', skyColor: '#2a2a3a', groundColor: '#3a3a4a', image: 'assets/images/backgrounds/bg_snow.png' }
        ];
        this.currentBackground = 0;
        this.backgroundImages = {}; // 背景画像キャッシュ

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    // 画像を読み込み（キャッシュ付き）
    loadImage(src) {
        if (this.imageCache[src]) {
            return Promise.resolve(this.imageCache[src]);
        }
        if (this.imageLoadPromises[src]) {
            return this.imageLoadPromises[src];
        }

        this.imageLoadPromises[src] = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.imageCache[src] = img;
                resolve(img);
            };
            img.onerror = () => {
                // 画像読み込み失敗時はnullを返す（フォールバック用）
                this.imageCache[src] = null;
                resolve(null);
            };
            img.src = src;
        });

        return this.imageLoadPromises[src];
    }

    // キャラクター画像をプリロード
    async preloadCharacterImages(character) {
        if (!character.images) return;

        const states = ['idle', 'slash', 'defeat'];
        for (const state of states) {
            if (character.images[state]) {
                await this.loadImage(character.images[state]);
            }
        }
    }

    // 背景画像をプリロード
    async preloadBackgroundImages() {
        for (const bg of this.backgrounds) {
            if (bg.image) {
                await this.loadImage(bg.image);
            }
        }
    }

    resize() {
        // 縦画面：9:16のアスペクト比（または画面全体を使用）
        let width = window.innerWidth;
        let height = window.innerHeight;

        // 画面全体を使用
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;

        // ピクセルサイズを画面サイズに合わせて調整（縦画面用に最適化）
        this.pixelSize = Math.max(3, Math.floor(Math.min(width, height) / 80));

        // ピクセル化された描画を維持
        this.ctx.imageSmoothingEnabled = false;
    }

    // 背景を描画（縦画面・横並び用、画像対応版）
    drawBackground() {
        const bg = this.backgrounds[this.currentBackground];
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const ps = this.pixelSize;

        // 背景画像があればそちらを使用
        if (bg.image) {
            const img = this.imageCache[bg.image];
            if (img) {
                // 画像を画面全体に描画（アスペクト比を維持してカバー）
                const imgRatio = img.width / img.height;
                const screenRatio = w / h;
                let drawW, drawH, drawX, drawY;

                if (imgRatio > screenRatio) {
                    // 画像の方が横長：高さに合わせる
                    drawH = h;
                    drawW = h * imgRatio;
                    drawX = (w - drawW) / 2;
                    drawY = 0;
                } else {
                    // 画像の方が縦長：幅に合わせる
                    drawW = w;
                    drawH = w / imgRatio;
                    drawX = 0;
                    drawY = (h - drawH) / 2;
                }

                ctx.drawImage(img, drawX, drawY, drawW, drawH);
                return;
            }
        }

        // フォールバック：プログラム生成の背景
        // 空のグラデーション
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, bg.skyColor);
        gradient.addColorStop(0.5, this.lightenColor(bg.skyColor, 15));
        gradient.addColorStop(0.7, bg.groundColor);
        gradient.addColorStop(1, this.darkenColor(bg.groundColor, 10));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // 地面ライン（キャラクターの足元）
        const groundY = h * 0.55;
        ctx.fillStyle = this.darkenColor(bg.groundColor, 15);
        ctx.fillRect(0, groundY, w, h - groundY);

        // 背景要素を描画
        this.drawBackgroundElements(bg.name, groundY);
    }

    // 色を暗くする
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    drawBackgroundElements(bgName, groundY) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const ps = this.pixelSize;
        const time = this.animationFrame * 0.02;

        switch (bgName) {
            case 'susuki':
                // ススキを地面から生やす
                for (let i = 0; i < 12; i++) {
                    const x = (w * (i + 0.5)) / 12;
                    const sway = Math.sin(time + i * 0.5) * ps * 2;
                    this.drawSusuki(x + sway, groundY, ps * (15 + (i % 5)));
                }
                break;

            case 'bamboo':
                // 竹を地面から生やす
                for (let i = 0; i < 8; i++) {
                    const x = (w * (i + 0.3)) / 8;
                    this.drawBamboo(x, groundY, ps * (20 + (i % 8)));
                }
                break;

            case 'rain':
                // 雨を描画
                ctx.strokeStyle = 'rgba(150, 150, 200, 0.4)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 120; i++) {
                    const x = (i * 13 + this.animationFrame * 1.5) % w;
                    const y = (i * 19 + this.animationFrame * 10) % h;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x - 3, y + 20);
                    ctx.stroke();
                }
                break;

            case 'snow':
                // 雪を描画
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                for (let i = 0; i < 60; i++) {
                    const x = (i * 23 + this.animationFrame * 0.3 + Math.sin(this.animationFrame * 0.015 + i) * 30) % w;
                    const y = (i * 29 + this.animationFrame * 1.2) % h;
                    const size = ps * (0.5 + (i % 3) * 0.3);
                    ctx.fillRect(x, y, size, size);
                }
                // 積もった雪
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(0, groundY, w, ps * 2);
                break;
        }

        // 月を描画
        this.drawMoon(w * 0.85, h * 0.1, ps * 5);
    }

    drawSusuki(x, groundY, height) {
        const ctx = this.ctx;
        const ps = this.pixelSize;
        const sway = Math.sin(this.animationFrame * 0.03 + x * 0.01) * ps;

        // 茎
        ctx.strokeStyle = '#5a4a3a';
        ctx.lineWidth = ps;
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.quadraticCurveTo(x + sway, groundY - height * 0.5, x + sway * 2, groundY - height);
        ctx.stroke();

        // 穂
        ctx.fillStyle = '#c4a574';
        for (let i = 0; i < 5; i++) {
            const px = x + sway * 2 + (Math.random() - 0.5) * ps * 3;
            const py = groundY - height - i * ps * 2;
            ctx.fillRect(px, py, ps, ps * 3);
        }
    }

    drawBamboo(x, groundY, height) {
        const ctx = this.ctx;
        const ps = this.pixelSize;

        // 竹の幹
        ctx.fillStyle = '#4a6a4a';
        ctx.fillRect(x - ps, groundY - height, ps * 2, height);

        // 節
        ctx.fillStyle = '#3a5a3a';
        for (let i = 1; i < height / (ps * 10); i++) {
            ctx.fillRect(x - ps * 1.5, groundY - i * ps * 10, ps * 3, ps);
        }

        // 葉（上部）
        ctx.fillStyle = '#5a8a5a';
        const sway = Math.sin(this.animationFrame * 0.02 + x * 0.01) * ps;
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + sway + ps * (i - 1) * 3, groundY - height - ps * 2, ps * 4, ps);
            ctx.fillRect(x + sway + ps * (i - 1) * 3, groundY - height - ps * 4, ps * 3, ps);
        }
    }

    drawMoon(x, y, radius) {
        const ctx = this.ctx;

        // 月光
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.15)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // 月本体
        ctx.fillStyle = '#ffffcc';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // キャラクターを描画（画像対応版）
    drawCharacter(character, x, y, state = 'idle', flip = false, alpha = 1) {
        const ctx = this.ctx;
        const ps = this.pixelSize;

        ctx.save();
        ctx.globalAlpha = alpha;

        // 画像があればそちらを使用
        if (character.images && character.images[state]) {
            const img = this.imageCache[character.images[state]];
            if (img) {
                // 画像の実サイズを取得し、アスペクト比を維持してスケール
                let scale;
                if (state === 'defeat') {
                    // defeat（倒れた状態）は横長なので、高さ基準でスケール
                    // idle/slashと同じキャラの高さを維持
                    const baseHeight = ps * 16;
                    scale = baseHeight / img.height;
                } else {
                    // idle/slashは縦長なので、幅基準でスケール
                    const baseWidth = ps * 16;
                    scale = baseWidth / img.width;
                }
                const imgW = img.width * scale;
                const imgH = img.height * scale;

                if (flip) {
                    ctx.translate(x + imgW, y);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, 0, 0, imgW, imgH);
                } else {
                    ctx.drawImage(img, x, y, imgW, imgH);
                }

                ctx.restore();
                return;
            }
        }

        // フォールバック：テキストスプライトを使用
        const sprite = character.sprite[state];
        if (!sprite) {
            ctx.restore();
            return;
        }

        if (flip) {
            ctx.translate(x + ps * 8, y);
            ctx.scale(-1, 1);
            x = 0;
            y = 0;
        }

        for (let row = 0; row < sprite.length; row++) {
            for (let col = 0; col < sprite[row].length; col++) {
                const char = sprite[row][col];
                let color = null;

                switch (char) {
                    case '#': color = character.color; break;
                    case '@': color = '#ffffff'; break; // 目
                    case 'x': color = '#333333'; break; // 閉じた目
                    case 'o': color = '#888888'; break; // 老人の目
                    case '=': color = '#cccccc'; break; // 刀
                    case 'v': color = '#aaaaaa'; break; // 髭
                    case '.': color = null; break;
                    default: color = character.accentColor;
                }

                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x + col * ps, y + row * ps, ps, ps);
                }
            }
        }

        ctx.restore();
    }

    // 斬撃エフェクト（横斬り）
    drawSlashEffect(x, y, progress) {
        const ctx = this.ctx;
        const ps = this.pixelSize;
        const alpha = 1 - progress;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = ps * 2;
        ctx.lineCap = 'round';

        const length = ps * 30 * (0.5 + progress * 0.5);

        // 横の斬撃
        ctx.beginPath();
        ctx.moveTo(x - length * 0.5, y - length * 0.3);
        ctx.lineTo(x + length * 0.5, y + length * 0.3);
        ctx.stroke();

        // 光の粒子
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
            const px = x + (Math.random() - 0.5) * length;
            const py = y + (Math.random() - 0.5) * length * 0.5;
            ctx.fillRect(px, py, ps, ps);
        }

        ctx.restore();
    }

    // 色を明るくする
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    // 背景を切り替え
    nextBackground() {
        this.currentBackground = (this.currentBackground + 1) % this.backgrounds.length;
    }

    // フレーム更新
    update() {
        this.animationFrame++;
    }

    // 画面クリア
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

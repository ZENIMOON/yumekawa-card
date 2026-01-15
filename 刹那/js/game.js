// ゲームステート
const GameState = {
    TITLE: 'title',
    DIALOGUE: 'dialogue',
    WAITING: 'waiting',      // 静寂（合図前）
    SIGNAL: 'signal',        // 合図表示中
    RESULT_WIN: 'result_win',
    VICTORY_LINE: 'victory_line', // 勝利セリフ表示中（プレイヤー）
    RESULT_LOSE: 'result_lose',
    ENEMY_VICTORY_LINE: 'enemy_victory_line', // 敵の勝利セリフ表示中
    GAME_OVER: 'game_over'
};

// ゲームクラス
class Game {
    constructor(renderer) {
        this.renderer = renderer;
        this.state = GameState.TITLE;

        // スコア
        this.currentScore = 0;
        this.highScore = this.loadHighScore();
        this.bestTime = this.loadBestTime();

        // キャラクター
        this.playerChar = CHARACTERS.ronin;
        this.enemyChar = null;

        // 戦闘タイマー
        this.waitTime = 0;          // 静寂の長さ
        this.waitTimer = 0;         // 静寂経過時間
        this.signalTime = 0.15;     // 合図表示時間（秒）- 面ごとに変化
        this.signalTimer = 0;       // 合図経過時間
        this.signalShown = false;   // 合図が表示されたか
        this.timeLimit = 0;         // 現在の制限時間（ミリ秒表示用）

        // 反応時間計測
        this.signalStartTime = 0;   // 合図が表示された時刻
        this.reactionTime = 0;      // 反応時間（ミリ秒）
        this.lastReactionTime = 0;  // 直前の反応時間

        // 会話
        this.currentDialogue = [];
        this.dialogueIndex = 0;

        // アニメーション
        this.playerState = 'idle';
        this.enemyState = 'idle';
        this.slashEffect = null;

        // すれ違いアニメーション
        this.crossingAnimation = {
            active: false,
            progress: 0,      // 0〜1
            duration: 0.4     // 秒
        };

        // UI要素
        this.uiElements = {
            currentScore: document.getElementById('current-score'),
            highScore: document.getElementById('high-score'),
            centerText: document.getElementById('center-text'),
            dialogueBox: document.getElementById('dialogue-box'),
            dialogueName: document.getElementById('dialogue-name'),
            dialogueText: document.getElementById('dialogue-text'),
            timeBoard: document.getElementById('time-board'),
            timeDisplay: document.getElementById('time-display'),
            resultTime: document.getElementById('result-time'),
            victoryLine: document.getElementById('victory-line')
        };

        // ブラックアウト用オーバーレイを作成
        this.blackoutOverlay = document.createElement('div');
        this.blackoutOverlay.className = 'blackout-overlay';
        document.body.appendChild(this.blackoutOverlay);

        this.updateUI();
    }

    // ハイスコア読み込み
    loadHighScore() {
        const saved = localStorage.getItem('samurai_highscore');
        return saved ? parseInt(saved, 10) : 0;
    }

    // ハイスコア保存
    saveHighScore() {
        localStorage.setItem('samurai_highscore', this.highScore.toString());
    }

    // ベストタイム読み込み
    loadBestTime() {
        const saved = localStorage.getItem('samurai_besttime');
        return saved ? parseInt(saved, 10) : 9999;
    }

    // ベストタイム保存
    saveBestTime() {
        localStorage.setItem('samurai_besttime', this.bestTime.toString());
    }

    // 面ごとの制限時間を計算（ミリ秒）
    // 1面: 970ms, 2面: 730ms, ... 徐々に短くなる
    calcTimeLimit(stage) {
        // 基本値: 970ms、最小値: 80ms
        // 段階的に減少: 970 → 730 → 550 → 420 → 320 → 250 → 200 → 160 → 130 → 110 → 100 → 90 → 80...
        const baseTime = 970;
        const minTime = 80;

        if (stage <= 1) return baseTime;

        // 減少率を段階的に変化させる
        let time = baseTime;
        for (let i = 1; i < stage; i++) {
            if (time > 500) {
                time = Math.floor(time * 0.75); // 序盤は大きく減少
            } else if (time > 200) {
                time = Math.floor(time * 0.8);  // 中盤は緩やかに
            } else if (time > 100) {
                time = Math.floor(time * 0.85); // 終盤はさらに緩やかに
            } else {
                time = Math.max(minTime, time - 5); // 最終段階は5msずつ
            }
        }

        return Math.max(minTime, time);
    }

    // UI更新
    updateUI() {
        this.uiElements.currentScore.textContent = `現在：${this.currentScore}人斬り`;
        this.uiElements.highScore.textContent = `最高：${this.highScore}人斬り`;
    }

    // 敵の反応時間を表示（敗北時）
    updateTimeDisplayEnemy(ms) {
        const display = this.uiElements.timeDisplay;
        display.textContent = `${ms} ms`;
        display.className = 'enemy';
    }

    // 反応時間表示を更新（プレイヤー勝利時）
    updateTimeDisplay(ms) {
        const display = this.uiElements.timeDisplay;
        display.textContent = `${ms} ms`;

        // 反応時間に応じて色を変更
        display.className = '';
        if (ms < 100) {
            display.classList.add('excellent');
        } else if (ms < 150) {
            display.classList.add('good');
        } else {
            display.classList.add('slow');
        }
    }

    // 木の板を表示
    showTimeBoard() {
        this.uiElements.timeBoard.classList.remove('hidden');
    }

    // 木の板を非表示
    hideTimeBoard() {
        this.uiElements.timeBoard.classList.add('hidden');
    }

    // 中央テキスト表示
    showCenterText(text, className = '') {
        const el = this.uiElements.centerText;
        el.textContent = text;
        el.className = className ? `visible ${className}` : 'visible';
    }

    // 中央テキスト非表示
    hideCenterText() {
        this.uiElements.centerText.className = '';
    }

    // 会話表示
    showDialogue(speaker, text) {
        const speakerChar = CHARACTERS[speaker] || this.playerChar;
        this.uiElements.dialogueName.textContent = speakerChar.name;
        this.uiElements.dialogueText.textContent = text;
        this.uiElements.dialogueBox.classList.remove('hidden');
    }

    // 会話非表示
    hideDialogue() {
        this.uiElements.dialogueBox.classList.add('hidden');
    }

    // 勝利セリフ表示
    showVictoryLine(charId) {
        const char = CHARACTERS[charId] || this.playerChar;
        const line = getVictoryLine(charId);
        const victoryEl = this.uiElements.victoryLine;
        victoryEl.querySelector('.speaker').textContent = char.name;
        victoryEl.querySelector('.line').textContent = line;
        victoryEl.classList.remove('hidden');
    }

    // 勝利セリフ非表示
    hideVictoryLine() {
        this.uiElements.victoryLine.classList.add('hidden');
    }

    // ブラックアウト開始
    // prepareCallback: ブラックアウト中に実行（シーン準備）
    // afterCallback: ブラックアウト解除後に実行（UI表示）
    startBlackout(prepareCallback, afterCallback = null, duration = 800) {
        this.blackoutOverlay.classList.add('active');
        setTimeout(() => {
            // ブラックアウト中にシーン準備
            if (prepareCallback) prepareCallback();
        }, duration / 2);
        // ブラックアウト終了後にオーバーレイを解除
        setTimeout(() => {
            this.blackoutOverlay.classList.remove('active');
            // ブラックアウト解除後にコールバック実行
            if (afterCallback) afterCallback();
        }, duration);
    }

    // ゲーム開始
    startGame() {
        this.currentScore = 0;
        this.lastReactionTime = 0;
        this.updateUI();
        this.hideTimeBoard();
        this.startBattle();
    }

    // 戦闘開始（準備のみ、会話表示は別）
    prepareBattle() {
        // 敵をランダムに選択
        this.enemyChar = getRandomEnemy();

        // 3戦ごとに背景を変える
        if (this.currentScore > 0 && this.currentScore % 3 === 0) {
            this.renderer.nextBackground();
        }

        // 今回の制限時間を計算（次の面 = currentScore + 1）
        this.timeLimit = this.calcTimeLimit(this.currentScore + 1);
        this.signalTime = this.timeLimit / 1000; // 秒に変換

        // 会話を取得
        this.currentDialogue = getDialogue(this.playerChar.id, this.enemyChar.id);
        this.dialogueIndex = 0;

        // 状態リセット
        this.playerState = 'idle';
        this.enemyState = 'idle';
        this.slashEffect = null;
        this.signalShown = false;
        this.reactionTime = 0;
        this.crossingAnimation.active = false;
        this.crossingAnimation.progress = 0;
    }

    // 会話表示開始
    startDialogue() {
        // 会話フェーズへ
        this.state = GameState.DIALOGUE;
        this.showDialogue(
            this.currentDialogue[0].speaker,
            this.currentDialogue[0].text
        );

        audioManager.playStartSE();
    }

    // 戦闘開始（ゲーム開始時用、即座に会話表示）
    startBattle() {
        this.prepareBattle();
        this.startDialogue();
    }

    // 会話を進める
    advanceDialogue() {
        this.dialogueIndex++;

        if (this.dialogueIndex < this.currentDialogue.length) {
            this.showDialogue(
                this.currentDialogue[this.dialogueIndex].speaker,
                this.currentDialogue[this.dialogueIndex].text
            );
        } else {
            // 会話終了、勝負開始
            this.hideDialogue();
            this.startShowdown();
        }
    }

    // 勝負開始
    startShowdown() {
        // 「勝負」を表示
        this.showCenterText('勝負', 'shoubu');
        audioManager.playStartSE();

        // 木の板は勝敗後に表示するので、ここでは非表示
        this.hideTimeBoard();

        setTimeout(() => {
            this.hideCenterText();
            this.enterWaitingPhase();
        }, 400);
    }

    // 静寂フェーズへ
    enterWaitingPhase() {
        this.state = GameState.WAITING;
        this.waitTime = 1.2 + Math.random() * 2.8; // 1.2〜4.0秒
        this.waitTimer = 0;
        this.signalShown = false;
    }

    // タップ処理
    handleTap() {
        switch (this.state) {
            case GameState.DIALOGUE:
                this.advanceDialogue();
                break;

            case GameState.WAITING:
                // 早斬り - 敗北
                this.lose('早すぎた……');
                break;

            case GameState.SIGNAL:
                // 成功！反応時間を計測
                this.reactionTime = Math.round(performance.now() - this.signalStartTime);
                this.win();
                break;

            case GameState.RESULT_WIN:
            case GameState.RESULT_LOSE:
                // 結果表示中は無視
                break;

            case GameState.VICTORY_LINE:
                // 勝利セリフ表示中 → 次の戦闘へ
                this.goToNextBattle();
                break;

            case GameState.ENEMY_VICTORY_LINE:
                // 敵の勝利セリフ表示中 → ゲームオーバーへ
                this.goToGameOver();
                break;

            case GameState.GAME_OVER:
                // ゲームオーバー画面では無視（ボタンで操作）
                break;
        }
    }

    // 勝利処理
    win() {
        this.state = GameState.RESULT_WIN;
        this.hideCenterText();

        // 反応時間を表示
        this.lastReactionTime = this.reactionTime;
        this.updateTimeDisplay(this.reactionTime);
        this.showTimeBoard();

        // ベストタイム更新
        if (this.reactionTime < this.bestTime) {
            this.bestTime = this.reactionTime;
            this.saveBestTime();
        }

        // 斬撃アニメーション
        this.playerState = 'slash';
        audioManager.playSlashSE();

        // 斬撃エフェクト（横並び用に位置調整）
        this.slashEffect = {
            x: this.renderer.width * 0.65,
            y: this.renderer.height * 0.48,
            progress: 0
        };

        // すれ違いアニメーション開始
        this.crossingAnimation.active = true;
        this.crossingAnimation.progress = 0;

        // 敵が倒れる（すれ違い完了後）
        const crossingDuration = this.crossingAnimation.duration * 1000;
        setTimeout(() => {
            this.enemyState = 'defeat';
        }, crossingDuration + 100);

        // スコア更新
        this.currentScore++;
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
        this.updateUI();

        // 勝利セリフを表示（すれ違い完了後）→ クリック待ちへ
        setTimeout(() => {
            this.hideTimeBoard();
            this.showVictoryLine(this.playerChar.id);
            this.state = GameState.VICTORY_LINE;
        }, crossingDuration + 400);
    }

    // 次の戦闘へ進む（勝利セリフ後）
    goToNextBattle() {
        this.hideVictoryLine();
        this.startBlackout(
            () => { this.prepareBattle(); },  // ブラックアウト中に準備
            () => { this.startDialogue(); },  // ブラックアウト解除後に会話表示
            400
        );
    }

    // 敗北処理
    lose(message) {
        this.state = GameState.RESULT_LOSE;
        this.hideCenterText();

        // NPCの反応時間（制限時間）を表示
        this.updateTimeDisplayEnemy(this.timeLimit);
        this.showTimeBoard();

        // 敵が斬るアニメーション
        this.enemyState = 'slash';
        audioManager.playSlashSE();

        // 斬撃エフェクト（敵側から）
        this.slashEffect = {
            x: this.renderer.width * 0.35,
            y: this.renderer.height * 0.48,
            progress: 0
        };

        // すれ違いアニメーション開始
        this.crossingAnimation.active = true;
        this.crossingAnimation.progress = 0;

        // プレイヤーが倒れる（すれ違い完了後）
        const crossingDuration = this.crossingAnimation.duration * 1000;
        setTimeout(() => {
            this.playerState = 'defeat';
            audioManager.playDefeatSE();
        }, crossingDuration + 100);

        // 画面を暗くするフラッシュ
        this.flashScreen();

        // 敵の勝利セリフを表示（すれ違い完了後）→ クリック待ちへ
        setTimeout(() => {
            this.hideTimeBoard();
            this.showVictoryLine(this.enemyChar.id);
            this.state = GameState.ENEMY_VICTORY_LINE;
        }, crossingDuration + 400);
    }

    // ゲームオーバーへ進む（敵の勝利セリフ後）
    goToGameOver() {
        this.hideVictoryLine();
        this.startBlackout(
            null,  // 準備不要
            () => { this.showGameOver(); },  // ブラックアウト解除後にゲームオーバー表示
            400
        );
    }

    // 画面フラッシュ
    flashScreen() {
        const flash = document.createElement('div');
        flash.className = 'flash-overlay active';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }

    // ゲームオーバー表示
    showGameOver() {
        this.state = GameState.GAME_OVER;

        document.getElementById('result-message').textContent =
            this.currentScore > 0 ? '無念……' : '修行が足りぬ……';
        document.getElementById('result-score').textContent =
            `${this.currentScore}人斬り`;

        // 最速タイムも表示
        if (this.bestTime < 9999) {
            this.uiElements.resultTime.textContent = `最速：${this.bestTime} ms`;
        } else {
            this.uiElements.resultTime.textContent = '';
        }

        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');
    }

    // 更新処理
    update(deltaTime) {
        this.renderer.update();

        // 斬撃エフェクト更新
        if (this.slashEffect) {
            this.slashEffect.progress += deltaTime * 3;
            if (this.slashEffect.progress >= 1) {
                this.slashEffect = null;
            }
        }

        // すれ違いアニメーション更新
        if (this.crossingAnimation.active) {
            this.crossingAnimation.progress += deltaTime / this.crossingAnimation.duration;
            if (this.crossingAnimation.progress >= 1) {
                this.crossingAnimation.progress = 1;
                this.crossingAnimation.active = false;
            }
        }

        switch (this.state) {
            case GameState.WAITING:
                this.waitTimer += deltaTime;
                if (this.waitTimer >= this.waitTime) {
                    // 合図表示
                    this.state = GameState.SIGNAL;
                    this.signalTimer = 0;
                    this.signalShown = true;
                    this.signalStartTime = performance.now(); // 反応時間計測開始
                    this.showCenterText('刹');
                }
                break;

            case GameState.SIGNAL:
                this.signalTimer += deltaTime;
                if (this.signalTimer >= this.signalTime) {
                    // 合図が消えた - 遅すぎた
                    this.hideCenterText();
                    this.lose('遅すぎた……');
                }
                break;

            case GameState.RESULT_WIN:
            case GameState.RESULT_LOSE:
                // setTimeoutで制御するため、ここでは何もしない
                break;
        }
    }

    // 描画処理
    render() {
        const r = this.renderer;
        r.clear();
        r.drawBackground();

        // 縦画面でも横並び：左右に対峙
        const charWidth = r.pixelSize * 16;
        const charHeight = r.pixelSize * 16;
        const groundY = r.height * 0.55; // 画面中央よりやや上

        // 基本位置
        let playerBaseX = r.width * 0.15;
        let enemyBaseX = r.width * 0.85 - charWidth;
        const playerY = groundY - charHeight;
        const enemyY = groundY - charHeight;

        // すれ違いアニメーション適用
        let playerX = playerBaseX;
        let enemyX = enemyBaseX;
        let playerFlip = false;
        let enemyFlip = true;

        if (this.crossingAnimation.active || this.crossingAnimation.progress > 0) {
            const progress = this.crossingAnimation.progress;
            // イージング（スムーズな加速→減速）
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            // プレイヤーは右へ、敵は左へ移動
            const moveDistance = r.width * 0.7; // 移動距離
            playerX = playerBaseX + moveDistance * eased;
            enemyX = enemyBaseX - moveDistance * eased;

            // すれ違い後は向きを反転
            if (progress > 0.5) {
                playerFlip = true;
                enemyFlip = false;
            }
        }

        // プレイヤー描画
        const playerAlpha = this.playerState === 'defeat' ? 0.7 : 1;
        r.drawCharacter(this.playerChar, playerX, playerY, this.playerState, playerFlip, playerAlpha);

        // 敵描画
        if (this.enemyChar) {
            const enemyAlpha = this.enemyState === 'defeat' ? 0.7 : 1;
            r.drawCharacter(this.enemyChar, enemyX, enemyY, this.enemyState, enemyFlip, enemyAlpha);
        }

        // 斬撃エフェクト
        if (this.slashEffect) {
            r.drawSlashEffect(
                this.slashEffect.x,
                this.slashEffect.y,
                this.slashEffect.progress
            );
        }
    }
}

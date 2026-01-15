// メインエントリーポイント
let game = null;
let renderer = null;
let lastTime = 0;

// 初期化
function init() {
    const canvas = document.getElementById('game-canvas');
    renderer = new Renderer(canvas);
    game = new Game(renderer);

    // イベントリスナー設定
    setupEventListeners();

    // ゲームループ開始
    requestAnimationFrame(gameLoop);
}

// イベントリスナー設定
function setupEventListeners() {
    // タイトル画面
    document.getElementById('start-btn').addEventListener('click', () => {
        audioManager.init().then(() => {
            audioManager.startBGM();
            showGameScreen();
            game.startGame();
        });
    });

    // BGM/SEトグル
    document.getElementById('bgm-toggle').addEventListener('change', (e) => {
        audioManager.setBGMEnabled(e.target.checked);
    });

    document.getElementById('se-toggle').addEventListener('change', (e) => {
        audioManager.setSEEnabled(e.target.checked);
    });

    // ゲーム画面タップ
    const gameScreen = document.getElementById('game-screen');
    gameScreen.addEventListener('click', handleGameTap);
    gameScreen.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleGameTap();
    }, { passive: false });

    // リザルト画面
    document.getElementById('retry-btn').addEventListener('click', () => {
        hideResultScreen();
        game.startGame();
    });

    document.getElementById('title-btn').addEventListener('click', () => {
        hideResultScreen();
        showTitleScreen();
    });

    // オーディオコンテキストの再開（iOS対応）
    document.addEventListener('touchstart', () => {
        audioManager.resume();
    }, { once: true });
}

// ゲームタップ処理
function handleGameTap() {
    if (game) {
        game.handleTap();
    }
}

// 画面表示切り替え
function showTitleScreen() {
    document.getElementById('title-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.add('hidden');
}

function showGameScreen() {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('result-screen').classList.add('hidden');
}

function hideResultScreen() {
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
}

// ゲームループ
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // 更新と描画
    if (game && game.state !== GameState.TITLE && game.state !== GameState.GAME_OVER) {
        game.update(deltaTime);
        game.render();
    } else if (game) {
        // タイトルやゲームオーバーでも背景は描画
        renderer.update();
        renderer.clear();
        renderer.drawBackground();
    }

    requestAnimationFrame(gameLoop);
}

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', init);

/**
 * 遊戲主類 - 管理遊戲整體邏輯和狀態
 */
import GameLoop from './GameLoop.js';
import GameState from './GameState.js';
import ResourceLoader from '../utils/ResourceLoader.js';
import Renderer from '../rendering/Renderer.js';
import InputHandler from '../controllers/InputHandler.js';
import SoundManager from '../audio/SoundManager.js';
import UI from '../ui/UI.js';
import Court from '../models/Court.js';
import Pikachu from '../models/Pikachu.js';
import Ball from '../models/Ball.js';
import Physics from '../physics/Physics.js';
import GameConfig from '../config/GameConfig.js';

class Game {
  constructor(canvasId) {
    // 獲取遊戲畫布
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // 設置畫布尺寸
    this.resizeCanvas();
    
    // 系統組件
    this.resourceLoader = new ResourceLoader();
    this.gameLoop = null;
    this.renderer = null;
    this.inputHandler = null;
    this.soundManager = null;
    this.physics = null;
    this.ui = null;
    
    // 遊戲狀態
    this.gameState = GameState.LOADING;
    
    // 遊戲物件
    this.court = null;
    this.players = {
      left: null,  // 左側皮卡丘
      right: null  // 右側皮卡丘
    };
    this.ball = null;
    
    // 遊戲數據
    this.score = {
      left: 0,
      right: 0
    };
    
    // 初始化事件監聽
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  /**
   * 調整畫布大小以適應窗口
   */
  resizeCanvas() {
    // 設定遊戲畫布的理想寬高比
    const aspectRatio = GameConfig.COURT_WIDTH / GameConfig.COURT_HEIGHT;
    
    // 獲取可用空間
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.9;
    
    let width, height;
    
    // 根據寬高比計算適合的尺寸
    if (maxWidth / maxHeight > aspectRatio) {
      // 以高度為基準
      height = maxHeight;
      width = height * aspectRatio;
    } else {
      // 以寬度為基準
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    // 設置畫布尺寸
    this.canvas.width = width;
    this.canvas.height = height;
    
    // 如果渲染器已經初始化，更新其尺寸
    if (this.renderer) {
      this.renderer.updateSize(width, height);
    }
    
    console.log(`Canvas resized to ${width}x${height}`);
  }
  
  /**
   * 加載遊戲所需的所有資源
   */
  loadResources() {
    console.log('開始加載遊戲資源...');
    
    // 設置加載進度和完成時的回調
    this.resourceLoader
      .onLoadProgress(progress => {
        // 可以更新載入畫面的進度條
        console.log(`Loading: ${progress}%`);
        
        // 如果UI已初始化，更新載入進度
        if (this.ui) {
          this.ui.updateLoadingProgress(progress);
        }
      })
      .onLoadComplete(() => {
        console.log('所有資源加載完成');
        this.initialize();
      });
    
    // 加載遊戲圖片
    this.resourceLoader.loadImages({
      // 皮卡丘相關圖片
      'pikachu-left': 'assets/images/sprites/pikachu-left.png',
      'pikachu-right': 'assets/images/sprites/pikachu-right.png',
      'pikachu-jump-left': 'assets/images/sprites/animations/pikachu-jump-left.png',
      'pikachu-jump-right': 'assets/images/sprites/animations/pikachu-jump-right.png',
      
      // 球場和球
      'court': 'assets/images/background/court.png',
      'ball': 'assets/images/sprites/ball.png',
      
      // UI元素
      'logo': 'assets/images/ui/logo.png',
      'button-play': 'assets/images/ui/button-play.png',
      'button-settings': 'assets/images/ui/button-settings.png'
    });
    
    // 加載音效
    this.resourceLoader.loadAudios({
      'hit': 'assets/audio/sfx/hit.mp3',
      'jump': 'assets/audio/sfx/jump.mp3',
      'score': 'assets/audio/sfx/score.mp3',
      'theme': 'assets/audio/music/theme.mp3'
    });
    
    // 開始載入
    this.resourceLoader.startLoading();
  }
  
  /**
   * 初始化遊戲核心組件和物件
   */
  initialize() {
    console.log('初始化遊戲組件...');
    
    // 初始化核心系統
    this.renderer = new Renderer(this.canvas, this.ctx);
    this.inputHandler = new InputHandler(this.canvas);
    this.soundManager = new SoundManager(this.resourceLoader);
    this.physics = new Physics();
    this.ui = new UI(this.ctx, this.resourceLoader);
    
    // 初始化遊戲場景和物件
    this.initializeGameObjects();
    
    // 創建遊戲循環
    this.gameLoop = new GameLoop();
    this.gameLoop.onUpdate = delta => this.update(delta);
    this.gameLoop.onRender = () => this.render();
    
    // 設置遊戲狀態為菜單
    this.changeGameState(GameState.MENU);
    
    // 播放背景音樂
    this.soundManager.playMusic('theme', 0.5, true);
    
    console.log('遊戲初始化完成');
  }
  
  /**
   * 初始化遊戲物件 (球場，皮卡丘，球)
   */
  initializeGameObjects() {
    // 創建球場
    this.court = new Court(this.resourceLoader.getImage('court'));
    
    // 創建皮卡丘角色
    const leftPikachu = new Pikachu(
      GameConfig.PIKACHU_LEFT_POSITION.x,
      GameConfig.PIKACHU_LEFT_POSITION.y,
      this.resourceLoader.getImage('pikachu-left'),
      'left'
    );
    
    const rightPikachu = new Pikachu(
      GameConfig.PIKACHU_RIGHT_POSITION.x,
      GameConfig.PIKACHU_RIGHT_POSITION.y,
      this.resourceLoader.getImage('pikachu-right'),
      'right'
    );
    
    this.players.left = leftPikachu;
    this.players.right = rightPikachu;
    
    // 創建排球
    this.ball = new Ball(
      GameConfig.COURT_WIDTH / 2,
      GameConfig.BALL_INITIAL_HEIGHT,
      this.resourceLoader.getImage('ball')
    );
    
    console.log('遊戲物件初始化完成');
  }
  
  /**
   * 開始新遊戲
   */
  startNewGame() {
    console.log('開始新遊戲');
    
    // 重置分數
    this.score = { left: 0, right: 0 };
    
    // 重置球和玩家位置
    this.resetPositions();
    
    // 更改遊戲狀態為進行中
    this.changeGameState(GameState.PLAYING);
    
    // 開始遊戲循環
    this.gameLoop.start();
  }
  
  /**
   * 重置球和玩家位置
   */
  resetPositions() {
    // 重置皮卡丘位置
    this.players.left.reset(
      GameConfig.PIKACHU_LEFT_POSITION.x,
      GameConfig.PIKACHU_LEFT_POSITION.y
    );
    
    this.players.right.reset(
      GameConfig.PIKACHU_RIGHT_POSITION.x,
      GameConfig.PIKACHU_RIGHT_POSITION.y
    );
    
    // 重置球位置
    this.ball.reset(
      GameConfig.COURT_WIDTH / 2,
      GameConfig.BALL_INITIAL_HEIGHT
    );
  }
  
  /**
   * 更改遊戲狀態
   * @param {GameState} newState - 新的遊戲狀態
   */
  changeGameState(newState) {
    const oldState = this.gameState;
    this.gameState = newState;
    
    console.log(`遊戲狀態從 ${oldState} 變更為 ${newState}`);
    
    // 根據新狀態執行相應邏輯
    switch (newState) {
      case GameState.MENU:
        this.gameLoop.pause();
        break;
        
      case GameState.PLAYING:
        this.gameLoop.resume();
        break;
        
      case GameState.PAUSED:
        this.gameLoop.pause();
        break;
        
      case GameState.GAME_OVER:
        // 顯示遊戲結束畫面
        break;
    }
  }
  
  /**
   * 暫停/繼續遊戲
   */
  togglePause() {
    if (this.gameState === GameState.PLAYING) {
      this.changeGameState(GameState.PAUSED);
    } else if (this.gameState === GameState.PAUSED) {
      this.changeGameState(GameState.PLAYING);
    }
  }
  
  /**
   * 計算得分
   * @param {string} scoringSide - 得分的一方 ('left' 或 'right')
   */
  scorePoint(scoringSide) {
    this.score[scoringSide]++;
    this.soundManager.playSound('score');
    
    console.log(`得分: ${this.score.left} - ${this.score.right}`);
    
    // 檢查是否有一方獲勝
    if (this.score[scoringSide] >= GameConfig.WINNING_SCORE) {
      this.changeGameState(GameState.GAME_OVER);
    } else {
      // 重置位置，準備下一回合
      this.resetPositions();
    }
  }
  
  /**
   * 遊戲邏輯更新
   * @param {number} deltaTime - 從上一幀到現在的時間差(毫秒)
   */
  update(deltaTime) {
    // 僅在遊戲進行中時更新
    if (this.gameState !== GameState.PLAYING) return;
    
    // 更新輸入狀態
    this.inputHandler.update();
    
    // 根據輸入更新左側皮卡丘
    if (this.inputHandler.isKeyPressed('ArrowLeft')) {
      this.players.left.moveLeft();
    }
    if (this.inputHandler.isKeyPressed('ArrowRight')) {
      this.players.left.moveRight();
    }
    if (this.inputHandler.isKeyPressed('ArrowUp')) {
      this.players.left.jump();
      this.soundManager.playSound('jump', 0.5);
    }
    
    // 根據輸入更新右側皮卡丘 (第二個玩家或AI)
    // ... 類似上面的代碼，但使用WASD或AI控制
    
    // 更新物件狀態
    this.players.left.update(deltaTime);
    this.players.right.update(deltaTime);
    this.ball.update(deltaTime);
    
    // 處理物理碰撞
    this.handleCollisions();
    
    // 檢查是否得分
    this.checkScoring();
  }
  
  /**
   * 處理所有物理碰撞
   */
  handleCollisions() {
    // 皮卡丘與地面的碰撞
    this.physics.handleGroundCollision(this.players.left, GameConfig.GROUND_Y);
    this.physics.handleGroundCollision(this.players.right, GameConfig.GROUND_Y);
    
    // 球與地面的碰撞
    if (this.physics.handleGroundCollision(this.ball, GameConfig.GROUND_Y)) {
      this.soundManager.playSound('hit', 0.3);
    }
    
    // 球與網的碰撞
    this.physics.handleNetCollision(
      this.ball,
      GameConfig.NET_X,
      GameConfig.NET_Y,
      GameConfig.NET_WIDTH,
      GameConfig.NET_HEIGHT
    );
    
    // 球與皮卡丘的碰撞
    if (this.physics.checkCircleCollision(this.ball, this.players.left)) {
      this.soundManager.playSound('hit');
    }
    
    if (this.physics.checkCircleCollision(this.ball, this.players.right)) {
      this.soundManager.playSound('hit');
    }
    
    // 限制皮卡丘在各自半場
    this.physics.constrainToHalfCourt(this.players.left, 'left', GameConfig.NET_X);
    this.physics.constrainToHalfCourt(this.players.right, 'right', GameConfig.NET_X);
  }
  
  /**
   * 檢查是否有一方得分
   */
  checkScoring() {
    // 檢查球是否落地
    if (this.ball.y + this.ball.radius >= GameConfig.GROUND_Y) {
      // 確認球落在哪一側
      if (this.ball.x < GameConfig.NET_X) {
        // 球落在左側，右方得分
        this.scorePoint('right');
      } else {
        // 球落在右側，左方得分
        this.scorePoint('left');
      }
    }
  }
  
  /**
   * 渲染遊戲畫面
   */
  render() {
    // 清空畫布
    this.renderer.clear();
    
    // 根據遊戲狀態選擇要渲染的內容
    switch (this.gameState) {
      case GameState.LOADING:
        this.ui.renderLoadingScreen(this.resourceLoader.getLoadingProgress());
        break;
        
      case GameState.MENU:
        this.ui.renderMainMenu();
        break;
        
      case GameState.PLAYING:
      case GameState.PAUSED:
        // 渲染遊戲場景
        this.renderer.renderCourt(this.court);
        this.renderer.renderPikachu(this.players.left);
        this.renderer.renderPikachu(this.players.right);
        this.renderer.renderBall(this.ball);
        
        // 渲染分數和UI
        this.ui.renderScore(this.score);
        
        // 如果遊戲暫停，渲染暫停覆蓋層
        if (this.gameState === GameState.PAUSED) {
          this.ui.renderPauseOverlay();
        }
        break;
        
      case GameState.GAME_OVER:
        // 渲染遊戲結束畫面
        this.ui.renderGameOver(this.score);
        break;
    }
  }
}

export default Game;
/**
 * 遊戲循環 - 管理遊戲的主循環邏輯，控制更新和渲染的調用
 */
class GameLoop {
  constructor() {
    // 循環狀態
    this.isRunning = false;
    this.isPaused = false;
    
    // 時間追蹤
    this.lastFrameTime = 0;
    this.accumulatedTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    
    // FPS計算
    this.fpsUpdateInterval = 500; // 每半秒更新一次FPS
    this.lastFpsUpdate = 0;
    
    // 目標幀率和固定時間步長
    this.targetFPS = 60;
    this.frameTime = 1000 / this.targetFPS; // 16.67ms for 60fps
    
    // 回調函數
    this.onUpdate = null;
    this.onRender = null;
    
    // 綁定循環函數的this上下文
    this.loop = this.loop.bind(this);
    
    // 保存requestAnimationFrame的ID以便取消
    this.animationFrameId = null;
  }
  
  /**
   * 開始遊戲循環
   */
  start() {
    if (this.isRunning) return;
    
    console.log('遊戲循環啟動');
    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.lastFpsUpdate = this.lastFrameTime;
    this.frameCount = 0;
    
    // 啟動循環
    this.animationFrameId = requestAnimationFrame(this.loop);
  }
  
  /**
   * 暫停遊戲循環
   */
  pause() {
    this.isPaused = true;
  }
  
  /**
   * 恢復遊戲循環
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastFrameTime = performance.now();
    }
  }
  
  /**
   * 停止遊戲循環
   */
  stop() {
    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('遊戲循環停止');
  }
  
  /**
   * 主循環函數
   * @param {number} currentTime - 當前時間戳 (由requestAnimationFrame提供)
   */
  loop(currentTime) {
    // 如果循環被停止，不進行處理
    if (!this.isRunning) return;
    
    // 計算自上一幀以來經過的時間
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    // 累計時間用於FPS計算
    this.accumulatedTime += deltaTime;
    this.frameCount++;
    
    // 每隔一段時間更新FPS
    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      // 計算FPS: 幀數 / 經過的秒數
      this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
      //console.log(`FPS: ${this.fps}`);
      
      // 重置計數器
      this.lastFpsUpdate = currentTime;
      this.frameCount = 0;
    }
    
    // 如果遊戲未暫停，執行更新
    if (!this.isPaused) {
      // 使用固定時間步長，避免物理計算中的不穩定性
      const fixedDeltaTime = Math.min(deltaTime, 32); // 最大32ms防止過大的時間步長
      
      // 調用更新回調
      if (this.onUpdate) {
        this.onUpdate(fixedDeltaTime);
      }
    }
    
    // 調用渲染回調
    if (this.onRender) {
      this.onRender();
    }
    
    // 繼續下一幀
    this.animationFrameId = requestAnimationFrame(this.loop);
  }
  
  /**
   * 獲取當前FPS
   * @returns {number} - 當前每秒幀數
   */
  getFPS() {
    return this.fps;
  }
  
  /**
   * 設置目標FPS
   * @param {number} fps - 目標每秒幀數
   */
  setTargetFPS(fps) {
    this.targetFPS = fps;
    this.frameTime = 1000 / fps;
  }
}

export default GameLoop;
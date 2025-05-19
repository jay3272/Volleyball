/**
 * 動畫系統 - 處理遊戲中的所有動畫效果
 */
class Animation {
  /**
   * 建立動畫
   * @param {Object} options - 動畫設置
   * @param {Array<Object>} options.frames - 動畫幀列表 [{image, x, y, width, height, duration}]
   * @param {boolean} options.loop - 是否循環播放 (預設: false)
   * @param {Function} options.onComplete - 動畫完成時的回調函數 (可選)
   */
  constructor(options) {
    this.frames = options.frames || [];
    this.loop = options.loop !== undefined ? options.loop : false;
    this.onComplete = options.onComplete || null;
    
    // 動畫狀態
    this.currentFrameIndex = 0;
    this.frameTime = 0;
    this.isPlaying = false;
    this.isComplete = false;
    
    // 如果沒有幀，設置為完成狀態
    if (this.frames.length === 0) {
      this.isComplete = true;
    }
    
    console.log(`Animation created with ${this.frames.length} frames`);
  }
  
  /**
   * 開始播放動畫
   * @param {boolean} restart - 是否從頭開始 (預設: true)
   */
  play(restart = true) {
    if (this.frames.length === 0) return;
    
    if (restart || this.isComplete) {
      this.currentFrameIndex = 0;
      this.frameTime = 0;
      this.isComplete = false;
    }
    
    this.isPlaying = true;
  }
  
  /**
   * 暫停動畫
   */
  pause() {
    this.isPlaying = false;
  }
  
  /**
   * 停止動畫並重置
   */
  stop() {
    this.isPlaying = false;
    this.currentFrameIndex = 0;
    this.frameTime = 0;
  }
  
  /**
   * 更新動畫狀態
   * @param {number} deltaTime - 幀間隔時間(毫秒)
   */
  update(deltaTime) {
    if (!this.isPlaying || this.isComplete) return;
    
    // 獲取當前幀
    const currentFrame = this.frames[this.currentFrameIndex];
    
    // 更新幀時間
    this.frameTime += deltaTime;
    
    // 如果當前幀時間結束，前進到下一幀
    if (this.frameTime >= currentFrame.duration) {
      this.frameTime = 0;
      this.currentFrameIndex++;
      
      // 檢查是否結束
      if (this.currentFrameIndex >= this.frames.length) {
        if (this.loop) {
          // 循環播放則返回第一幀
          this.currentFrameIndex = 0;
        } else {
          // 非循環則設為完成狀態
          this.currentFrameIndex = this.frames.length - 1;
          this.isPlaying = false;
          this.isComplete = true;
          
          // 觸發完成回調
          if (this.onComplete) {
            this.onComplete();
          }
        }
      }
    }
  }
  
  /**
   * 獲取當前動畫幀
   * @returns {Object|null} 當前幀對象或null
   */
  getCurrentFrame() {
    if (this.frames.length === 0) return null;
    return this.frames[this.currentFrameIndex];
  }
  
  /**
   * 設置動畫速度
   * @param {number} speedFactor - 速度因子 (1.0為正常速度)
   */
  setSpeed(speedFactor) {
    if (speedFactor <= 0) {
      console.warn('Animation speed factor must be greater than 0');
      return;
    }
    
    // 對所有幀的持續時間進行調整
    this.frames.forEach(frame => {
      frame.originalDuration = frame.originalDuration || frame.duration;
      frame.duration = frame.originalDuration / speedFactor;
    });
  }
  
  /**
   * 複製動畫 (用於創建相同動畫的多個實例)
   * @returns {Animation} 新的動畫實例
   */
  clone() {
    const clonedFrames = this.frames.map(frame => ({...frame}));
    return new Animation({
      frames: clonedFrames,
      loop: this.loop,
      onComplete: this.onComplete
    });
  }
  
  /**
   * 反轉動畫播放順序
   * @returns {Animation} 返回this以支持鏈式調用
   */
  reverse() {
    this.frames = [...this.frames].reverse();
    return this;
  }
  
  /**
   * 獲取動畫進度 (0-1)
   * @returns {number} 動畫進度
   */
  getProgress() {
    if (this.frames.length === 0) return 0;
    
    const totalFrames = this.frames.length;
    const currentFrame = this.currentFrameIndex;
    const frameDuration = this.frames[currentFrame].duration;
    
    // 計算當前幀的進度 (0-1)
    const frameProgress = frameDuration > 0 ? this.frameTime / frameDuration : 0;
    
    // 計算總進度
    return (currentFrame + frameProgress) / totalFrames;
  }
  
  /**
   * 檢查動畫是否完成
   * @returns {boolean} 是否完成
   */
  isFinished() {
    return this.isComplete;
  }
  
  /**
   * 從精靈表創建動畫
   * @param {HTMLImageElement} spriteSheet - 精靈表圖片
   * @param {Object} options - 配置選項
   * @param {number} options.frameWidth - 每幀寬度(像素)
   * @param {number} options.frameHeight - 每幀高度(像素)
   * @param {number} options.startFrame - 起始幀 (預設: 0)
   * @param {number} options.endFrame - 結束幀 (預設: 精靈表的總幀數)
   * @param {number} options.frameDuration - 每幀持續時間(毫秒) (預設: 100)
   * @param {boolean} options.loop - 是否循環 (預設: false)
   * @param {Function} options.onComplete - 完成回調 (可選)
   * @returns {Animation} 動畫實例
   */
  static fromSpriteSheet(spriteSheet, options) {
    const {
      frameWidth, 
      frameHeight,
      startFrame = 0,
      endFrame = Math.floor(spriteSheet.width / frameWidth),
      frameDuration = 100,
      loop = false,
      onComplete = null
    } = options;
    
    // 計算每行/列的幀數
    const framesPerRow = Math.floor(spriteSheet.width / frameWidth);
    
    const frames = [];
    for (let i = startFrame; i < endFrame; i++) {
      // 計算精靈表中的行列位置
      const col = i % framesPerRow;
      const row = Math.floor(i / framesPerRow);
      
      frames.push({
        image: spriteSheet,
        x: col * frameWidth,
        y: row * frameHeight,
        width: frameWidth,
        height: frameHeight,
        duration: frameDuration
      });
    }
    
    return new Animation({
      frames,
      loop,
      onComplete
    });
  }
  
  /**
   * 從多個圖片創建動畫
   * @param {Array<HTMLImageElement>} images - 圖片數組
   * @param {number} frameDuration - 每幀持續時間(毫秒)
   * @param {boolean} loop - 是否循環
   * @param {Function} onComplete - 完成回調 (可選)
   * @returns {Animation} 動畫實例
   */
  static fromImages(images, frameDuration = 100, loop = false, onComplete = null) {
    const frames = images.map(image => ({
      image,
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
      duration: frameDuration
    }));
    
    return new Animation({
      frames,
      loop,
      onComplete
    });
  }
}

export default Animation;
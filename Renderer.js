/**
 * 渲染器類 - 處理遊戲畫面的繪製
 */
import GameConfig from '../config/GameConfig.js';

class Renderer {
  /**
   * 建立渲染器
   * @param {HTMLCanvasElement} canvas - 遊戲畫布元素
   * @param {CanvasRenderingContext2D} ctx - 畫布的2D繪圖上下文
   */
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // 畫布尺寸
    this.width = canvas.width;
    this.height = canvas.height;
    
    // 計算縮放比例 (用於將遊戲邏輯座標轉換為畫布像素座標)
    this.scaleX = this.width / GameConfig.COURT_WIDTH;
    this.scaleY = this.height / GameConfig.COURT_HEIGHT;
    
    // 調試模式
    this.debugMode = false;
    
    console.log(`Renderer initialized with scale: ${this.scaleX.toFixed(2)}x ${this.scaleY.toFixed(2)}`);
  }
  
  /**
   * 更新渲染器尺寸 (當畫布大小改變時呼叫)
   * @param {number} width - 新寬度
   * @param {number} height - 新高度
   */
  updateSize(width, height) {
    this.width = width;
    this.height = height;
    this.scaleX = width / GameConfig.COURT_WIDTH;
    this.scaleY = height / GameConfig.COURT_HEIGHT;
    
    console.log(`Renderer resized with scale: ${this.scaleX.toFixed(2)}x ${this.scaleY.toFixed(2)}`);
  }
  
  /**
   * 清空畫布
   * @param {string} color - 清空後的背景顏色 (預設為黑色)
   */
  clear(color = '#000000') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  /**
   * 將遊戲邏輯座標轉換為畫布像素座標
   * @param {number} x - 邏輯X座標
   * @param {number} y - 邏輯Y座標
   * @returns {Object} - 轉換後的像素座標 {x, y}
   */
  transformCoordinates(x, y) {
    return {
      x: x * this.scaleX,
      y: y * this.scaleY
    };
  }
  
  /**
   * 渲染排球場地
   * @param {Court} court - 球場對象
   */
  renderCourt(court) {
    // 如果有球場背景圖片，則繪製
    if (court.image) {
      this.ctx.drawImage(
        court.image,
        0, 0,
        this.width, this.height
      );
    } else {
      // 如果沒有圖片，則繪製基本的球場
      // 繪製地面
      this.ctx.fillStyle = '#F3E3A2';  // 沙灘顏色
      const groundY = GameConfig.GROUND_Y * this.scaleY;
      this.ctx.fillRect(0, groundY, this.width, this.height - groundY);
      
      // 繪製網
      this.ctx.fillStyle = '#FFFFFF';
      const netX = GameConfig.NET_X * this.scaleX;
      const netY = GameConfig.NET_Y * this.scaleY;
      const netWidth = GameConfig.NET_WIDTH * this.scaleX;
      const netHeight = GameConfig.NET_HEIGHT * this.scaleY;
      this.ctx.fillRect(netX - netWidth / 2, netY, netWidth, netHeight);
    }
    
    // 繪製邊界線 (如果處於調試模式)
    if (this.debugMode) {
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(0, 0, this.width, this.height);
    }
  }
  
  /**
   * 渲染排球
   * @param {Ball} ball - 排球對象
   */
  renderBall(ball) {
    const { x, y } = this.transformCoordinates(ball.x, ball.y);
    const radius = ball.radius * this.scaleX;  // 使用X軸縮放比例
    
    if (ball.sprite) {
      // 如果有精靈圖，渲染球的精靈圖
      this.ctx.drawImage(
        ball.sprite.image,
        ball.sprite.currentFrame * ball.sprite.frameWidth, 0,
        ball.sprite.frameWidth, ball.sprite.frameHeight,
        x - radius, y - radius,
        radius * 2, radius * 2
      );
    } else if (ball.image) {
      // 如果有靜態圖片，渲染球的圖片
      this.ctx.drawImage(
        ball.image,
        x - radius, y - radius,
        radius * 2, radius * 2
      );
    } else {
      // 如果沒有圖片，渲染基本的圓形
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fill();
      
      // 添加簡單的紋理
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#FF5733';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
    
    // 繪製碰撞範圍 (如果處於調試模式)
    if (this.debugMode) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'lime';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  
  /**
   * 渲染皮卡丘
   * @param {Pikachu} pikachu - 皮卡丘對象
   */
  renderPikachu(pikachu) {
    const { x, y } = this.transformCoordinates(pikachu.x, pikachu.y);
    const width = pikachu.width * this.scaleX;
    const height = pikachu.height * this.scaleY;
    
    // 根據方向翻轉皮卡丘
    const flipX = pikachu.direction === 'left';
    
    // 保存當前繪圖狀態
    this.ctx.save();
    
    // 如果需要翻轉，設置翻轉變換
    if (flipX) {
      this.ctx.translate(x + width / 2, y - height / 2);
      this.ctx.scale(-1, 1);
      this.ctx.translate(-(x + width / 2), -(y - height / 2));
    }
    
    if (pikachu.animation && pikachu.animation.isPlaying) {
      // 如果有正在播放的動畫，渲染動畫幀
      const frame = pikachu.animation.getCurrentFrame();
      this.ctx.drawImage(
        frame.image,
        frame.x, frame.y, frame.width, frame.height,
        x - width / 2, y - height,
        width, height
      );
    } else if (pikachu.sprite) {
      // 如果有精靈圖，渲染皮卡丘的精靈圖
      this.ctx.drawImage(
        pikachu.sprite.image,
        pikachu.sprite.currentFrame * pikachu.sprite.frameWidth, 0,
        pikachu.sprite.frameWidth, pikachu.sprite.frameHeight,
        x - width / 2, y - height,
        width, height
      );
    } else if (pikachu.image) {
      // 如果有靜態圖片，渲染皮卡丘的圖片
      this.ctx.drawImage(
        pikachu.image,
        x - width / 2, y - height,
        width, height
      );
    } else {
      // 如果沒有圖片，渲染基本的矩形
      this.ctx.fillStyle = pikachu.side === 'left' ? '#FFD700' : '#FF5733';
      this.ctx.fillRect(x - width / 2, y - height, width, height);
      
      // 添加簡單的臉部特徵
      this.ctx.fillStyle = '#000000';
      const eyeSize = width * 0.1;
      const eyeY = y - height * 0.7;
      const leftEyeX = x - width * 0.2;
      const rightEyeX = x + width * 0.1;
      
      // 眼睛
      this.ctx.beginPath();
      this.ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.beginPath();
      this.ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      // 嘴巴
      this.ctx.beginPath();
      this.ctx.arc(x, y - height * 0.5, width * 0.15, 0, Math.PI);
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }
    
    // 恢復繪圖狀態
    this.ctx.restore();
    
    // 繪製碰撞範圍 (如果處於調試模式)
    if (this.debugMode) {
      this.ctx.beginPath();
      this.ctx.arc(x, y - height / 2, pikachu.collisionRadius * this.scaleX, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'lime';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // 繪製邊界框
      this.ctx.strokeStyle = 'blue';
      this.ctx.strokeRect(x - width / 2, y - height, width, height);
    }
  }
  
  /**
   * 渲染特效
   * @param {Effect} effect - 特效對象
   */
  renderEffect(effect) {
    if (!effect.isActive) return;
    
    const { x, y } = this.transformCoordinates(effect.x, effect.y);
    
    this.ctx.save();
    this.ctx.globalAlpha = effect.opacity;
    
    if (effect.type === 'particle') {
      // 渲染粒子特效
      this.ctx.fillStyle = effect.color || '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(x, y, effect.size * this.scaleX, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (effect.type === 'sprite') {
      // 渲染精靈圖特效
      const frame = effect.getCurrentFrame();
      this.ctx.drawImage(
        effect.image,
        frame.x, frame.y, frame.width, frame.height,
        x - (effect.width * this.scaleX) / 2, 
        y - (effect.height * this.scaleY) / 2,
        effect.width * this.scaleX, 
        effect.height * this.scaleY
      );
    } else if (effect.type === 'text') {
      // 渲染文字特效
      this.ctx.font = `${effect.fontSize * this.scaleY}px ${effect.fontFamily || 'Arial'}`;
      this.ctx.fillStyle = effect.color || '#FFFFFF';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(effect.text, x, y);
    }
    
    this.ctx.restore();
  }
  
  /**
   * 渲染多個特效
   * @param {Array<Effect>} effects - 特效對象數組
   */
  renderEffects(effects) {
    effects.forEach(effect => this.renderEffect(effect));
  }
  
  /**
   * 渲染分數
   * @param {Object} score - 分數對象 {left: number, right: number}
   */
  renderScore(score) {
    const fontSize = this.height * 0.08;
    this.ctx.font = `bold ${fontSize}px Arial`;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    
    // 左側分數
    this.ctx.fillText(
      score.left.toString(),
      this.width * 0.25,
      fontSize * 1.5
    );
    
    // 右側分數
    this.ctx.fillText(
      score.right.toString(),
      this.width * 0.75,
      fontSize * 1.5
    );
  }
  
  /**
   * 渲染倒數計時
   * @param {number} countdown - 倒數秒數
   */
  renderCountdown(countdown) {
    const fontSize = this.height * 0.15;
    this.ctx.font = `bold ${fontSize}px Arial`;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // 添加輪廓使文字更醒目
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = fontSize * 0.05;
    this.ctx.strokeText(
      countdown.toString(),
      this.width / 2,
      this.height / 2
    );
    
    this.ctx.fillText(
      countdown.toString(),
      this.width / 2,
      this.height / 2
    );
  }
  
  /**
   * 開啟或關閉調試模式
   * @param {boolean} enabled - 是否開啟調試模式
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`Debug mode: ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export default Renderer;
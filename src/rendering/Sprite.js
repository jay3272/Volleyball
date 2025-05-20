/**
 * Sprite.js - 處理遊戲中的精靈圖
 * 負責從精靈表單(sprite sheet)中切割、管理和繪製遊戲角色和物件的圖像
 */

class Sprite {
    /**
     * 創建一個精靈對象
     * @param {Image} image - 精靈圖片資源
     * @param {number} frameWidth - 單個幀的寬度
     * @param {number} frameHeight - 單個幀的高度
     * @param {number} totalFrames - 總幀數
     * @param {number} framesPerRow - 每行的幀數 (用於精靈表單的計算)
     */
    constructor(image, frameWidth, frameHeight, totalFrames = 1, framesPerRow = 1) {
        this.image = image;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.totalFrames = totalFrames;
        this.framesPerRow = framesPerRow;
        this.currentFrame = 0;
        this.scale = 1;
        this.flipX = false;
        this.flipY = false;
        this.alpha = 1; // 透明度值
        this.rotation = 0; // 旋轉角度
        this.originX = 0.5; // 旋轉/縮放原點X (預設在中心)
        this.originY = 0.5; // 旋轉/縮放原點Y (預設在中心)
        this.tint = null; // 色調變化
    }

    /**
     * 設置精靈的當前幀
     * @param {number} frameIndex - 要設置的幀索引
     */
    setFrame(frameIndex) {
        if (frameIndex >= 0 && frameIndex < this.totalFrames) {
            this.currentFrame = frameIndex;
        } else {
            console.warn(`嘗試設置超出範圍的幀索引: ${frameIndex}`);
        }
    }

    /**
     * 設置精靈的縮放比例
     * @param {number} scale - 縮放值
     */
    setScale(scale) {
        this.scale = scale;
    }

    /**
     * 設置精靈是否水平翻轉
     * @param {boolean} flip - 是否水平翻轉
     */
    setFlipX(flip) {
        this.flipX = flip;
    }

    /**
     * 設置精靈是否垂直翻轉
     * @param {boolean} flip - 是否垂直翻轉
     */
    setFlipY(flip) {
        this.flipY = flip;
    }

    /**
     * 設置精靈的透明度
     * @param {number} alpha - 透明度值 (0-1)
     */
    setAlpha(alpha) {
        this.alpha = Math.max(0, Math.min(1, alpha));
    }

    /**
     * 設置精靈的旋轉角度
     * @param {number} angle - 角度值 (以弧度為單位)
     */
    setRotation(angle) {
        this.rotation = angle;
    }

    /**
     * 設置精靈的旋轉和縮放原點
     * @param {number} x - X軸原點 (0-1)
     * @param {number} y - Y軸原點 (0-1)
     */
    setOrigin(x, y) {
        this.originX = x;
        this.originY = y;
    }

    /**
     * 設置精靈的色調
     * @param {string} color - CSS顏色字符串
     */
    setTint(color) {
        this.tint = color;
    }

    /**
     * 重置精靈的所有變換
     */
    resetTransform() {
        this.scale = 1;
        this.flipX = false;
        this.flipY = false;
        this.alpha = 1;
        this.rotation = 0;
        this.tint = null;
    }

    /**
     * 計算當前幀在精靈表單中的位置
     * @returns {Object} 包含源矩形坐標和尺寸
     */
    getFrameSource() {
        const row = Math.floor(this.currentFrame / this.framesPerRow);
        const col = this.currentFrame % this.framesPerRow;
        
        return {
            x: col * this.frameWidth,
            y: row * this.frameHeight,
            width: this.frameWidth,
            height: this.frameHeight
        };
    }

    /**
     * 在canvas上繪製精靈
     * @param {CanvasRenderingContext2D} ctx - Canvas渲染上下文
     * @param {number} x - 繪製位置X坐標
     * @param {number} y - 繪製位置Y坐標
     * @param {number} width - 繪製寬度 (可選，默認使用幀寬度)
     * @param {number} height - 繪製高度 (可選，默認使用幀高度)
     */
    draw(ctx, x, y, width = this.frameWidth, height = this.frameHeight) {
        if (!this.image.complete) {
            return; // 圖像尚未加載完成，跳過繪製
        }
        
        // 保存當前繪圖狀態
        ctx.save();
        
        // 設置透明度
        ctx.globalAlpha = this.alpha;
        
        // 計算旋轉和縮放原點
        const pivotX = x + width * this.originX;
        const pivotY = y + height * this.originY;
        
        // 平移到旋轉原點
        ctx.translate(pivotX, pivotY);
        
        // 應用旋轉
        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        // 應用翻轉和縮放
        let scaleX = this.scale;
        let scaleY = this.scale;
        
        if (this.flipX) {
            scaleX *= -1;
        }
        
        if (this.flipY) {
            scaleY *= -1;
        }
        
        ctx.scale(scaleX, scaleY);
        
        // 平移回原點
        ctx.translate(-width * this.originX, -height * this.originY);
        
        // 獲取當前幀在精靈表單中的位置
        const source = this.getFrameSource();
        
        // 應用色調 (如果有)
        if (this.tint) {
            // 創建一個臨時畫布來應用色調
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = source.width;
            tempCanvas.height = source.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // 在臨時畫布上繪製原圖像
            tempCtx.drawImage(
                this.image,
                source.x, source.y, source.width, source.height,
                0, 0, source.width, source.height
            );
            
            // 應用色調
            tempCtx.globalCompositeOperation = 'multiply';
            tempCtx.fillStyle = this.tint;
            tempCtx.fillRect(0, 0, source.width, source.height);
            
            // 恢復混合模式
            tempCtx.globalCompositeOperation = 'destination-atop';
            tempCtx.drawImage(
                this.image,
                source.x, source.y, source.width, source.height,
                0, 0, source.width, source.height
            );
            
            // 繪製處理後的圖像
            ctx.drawImage(tempCanvas, 0, 0, source.width, source.height, 0, 0, width, height);
        } else {
            // 直接繪製原圖像
            ctx.drawImage(
                this.image,
                source.x, source.y, source.width, source.height,
                0, 0, width, height
            );
        }
        
        // 恢復先前的繪圖狀態
        ctx.restore();
    }

    /**
     * 從精靈表單中提取所有幀作為單獨的圖像數組
     * @returns {HTMLCanvasElement[]} 包含所有幀圖像的數組
     */
    extractFrames() {
        const frames = [];
        
        for (let i = 0; i < this.totalFrames; i++) {
            // 設置當前幀
            this.currentFrame = i;
            
            // 獲取幀源
            const source = this.getFrameSource();
            
            // 創建一個臨時畫布
            const canvas = document.createElement('canvas');
            canvas.width = this.frameWidth;
            canvas.height = this.frameHeight;
            const ctx = canvas.getContext('2d');
            
            // 將當前幀繪製到畫布上
            ctx.drawImage(
                this.image,
                source.x, source.y, source.width, source.height,
                0, 0, this.frameWidth, this.frameHeight
            );
            
            // 將畫布添加到幀數組
            frames.push(canvas);
        }
        
        // 重置當前幀
        this.currentFrame = 0;
        
        return frames;
    }

    /**
     * 克隆當前精靈實例
     * @returns {Sprite} 新的精靈實例
     */
    clone() {
        const clone = new Sprite(
            this.image,
            this.frameWidth,
            this.frameHeight,
            this.totalFrames,
            this.framesPerRow
        );
        
        clone.currentFrame = this.currentFrame;
        clone.scale = this.scale;
        clone.flipX = this.flipX;
        clone.flipY = this.flipY;
        clone.alpha = this.alpha;
        clone.rotation = this.rotation;
        clone.originX = this.originX;
        clone.originY = this.originY;
        clone.tint = this.tint;
        
        return clone;
    }
}

// 導出 Sprite 類
export default Sprite;
/**
 * 資源加載器 - 負責預加載遊戲所需的所有資源
 */
class ResourceLoader {
  constructor() {
    // 資源存儲對象
    this.resources = {
      images: {},
      audio: {},
      fonts: {}
    };
    
    // 加載狀態
    this.totalResources = 0;
    this.loadedResources = 0;
    
    // 加載完成的回調函數
    this.onComplete = null;
    this.onProgress = null;
  }
  
  /**
   * 加載圖片資源
   * @param {string} id - 圖片標識符
   * @param {string} src - 圖片路徑
   * @returns {ResourceLoader} - 返回this以支持鏈式調用
   */
  loadImage(id, src) {
    this.totalResources++;
    
    const image = new Image();
    image.onload = () => this._resourceLoaded();
    image.onerror = () => this._resourceError(src);
    image.src = src;
    
    this.resources.images[id] = image;
    return this;
  }
  
  /**
   * 批量加載圖片資源
   * @param {Object} imageMap - 圖片映射表 {id: src}
   * @returns {ResourceLoader} - 返回this以支持鏈式調用
   */
  loadImages(imageMap) {
    Object.entries(imageMap).forEach(([id, src]) => {
      this.loadImage(id, src);
    });
    return this;
  }
  
  /**
   * 加載音頻資源
   * @param {string} id - 音頻標識符
   * @param {string} src - 音頻路徑
   * @returns {ResourceLoader} - 返回this以支持鏈式調用
   */
  loadAudio(id, src) {
    this.totalResources++;
    
    const audio = new Audio();
    audio.oncanplaythrough = () => {
      // 確保事件只觸發一次
      audio.oncanplaythrough = null;
      this._resourceLoaded();
    };
    audio.onerror = () => this._resourceError(src);
    audio.src = src;
    
    this.resources.audio[id] = audio;
    return this;
  }
  
  /**
   * 批量加載音頻資源
   * @param {Object} audioMap - 音頻映射表 {id: src}
   * @returns {ResourceLoader} - 返回this以支持鏈式調用
   */
  loadAudios(audioMap) {
    Object.entries(audioMap).forEach(([id, src]) => {
      this.loadAudio(id, src);
    });
    return this;
  }
  
  /**
   * 加載字體資源
   * @param {string} fontFamily - 字體名稱
   * @param {string} src - 字體文件路徑
   * @returns {ResourceLoader} - 返回this以支持鏈式調用
   */
  loadFont(fontFamily, src) {
    this.totalResources++;
    
    const fontFace = new FontFace(fontFamily, `url(${src})`);
    fontFace.load().then(
      loadedFace => {
        document.fonts.add(loadedFace);
        this.resources.fonts[fontFamily] = loadedFace;
        this._resourceLoaded();
      },
      error => this._resourceError(`Font ${fontFamily}: ${error}`)
    );
    
    return this;
  }
  
  /**
   * 設置加載完成的回調函數
   * @param {Function} callback - 加載完成時調用的函數
   * @returns {ResourceLoader} - 返回this以支持鏈式調用
   */
  onLoadComplete(callback) {
    this.onComplete = callback;
    return this;
  }
  
  /**
   * 設置加載進度的回調函數
   * @param {Function} callback - 接收進度百分比(0-100)的函數
   * @returns {ResourceLoader} - 返回this以支持鏈式調用
   */
  onLoadProgress(callback) {
    this.onProgress = callback;
    return this;
  }
  
  /**
   * 開始加載所有資源
   * 如果沒有資源需要加載，則立即調用完成回調
   */
  startLoading() {
    if (this.totalResources === 0) {
      console.log('沒有資源需要加載');
      if (this.onComplete) {
        this.onComplete();
      }
    } else {
      console.log(`開始加載 ${this.totalResources} 個資源`);
    }
  }
  
  /**
   * 獲取指定ID的圖片資源
   * @param {string} id - 圖片標識符
   * @returns {HTMLImageElement|null} - 返回圖片對象或null
   */
  getImage(id) {
    return this.resources.images[id] || null;
  }
  
  /**
   * 獲取指定ID的音頻資源
   * @param {string} id - 音頻標識符
   * @returns {HTMLAudioElement|null} - 返回音頻對象或null
   */
  getAudio(id) {
    return this.resources.audio[id] || null;
  }
  
  /**
   * 播放指定ID的音效
   * @param {string} id - 音效標識符
   * @param {number} volume - 音量 (0-1)
   */
  playSound(id, volume = 1.0) {
    const sound = this.getAudio(id);
    if (sound) {
      // 克隆音頻節點以支持重疊播放
      const soundClone = sound.cloneNode();
      soundClone.volume = volume;
      soundClone.play().catch(e => console.error('音頻播放失敗:', e));
    } else {
      console.warn(`找不到音效: ${id}`);
    }
  }
  
  /**
   * 獲取當前加載進度 (0-100)
   * @returns {number} - 加載進度百分比
   */
  getLoadingProgress() {
    if (this.totalResources === 0) return 100;
    return Math.floor((this.loadedResources / this.totalResources) * 100);
  }
  
  /**
   * 資源成功加載的內部處理函數
   * @private
   */
  _resourceLoaded() {
    this.loadedResources++;
    
    const progress = this.getLoadingProgress();
    console.log(`資源加載進度: ${progress}%`);
    
    if (this.onProgress) {
      this.onProgress(progress);
    }
    
    if (this.loadedResources === this.totalResources) {
      console.log('所有資源加載完成');
      if (this.onComplete) {
        this.onComplete();
      }
    }
  }
  
  /**
   * 資源加載錯誤的內部處理函數
   * @param {string} resourceSrc - 資源路徑
   * @private
   */
  _resourceError(resourceSrc) {
    console.error(`加載資源失敗: ${resourceSrc}`);
    // 仍然計算這個資源已經"加載"，以便加載進度能繼續
    this._resourceLoaded();
  }
}

export default ResourceLoader;
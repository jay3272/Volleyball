/**
 * 遊戲狀態常量 - 定義遊戲可能的不同狀態
 */

const GameState = {
  /**
   * 資源加載中狀態
   * 遊戲正在加載所需的圖片、音頻等資源
   */
  LOADING: 'LOADING',
  
  /**
   * 主菜單狀態
   * 遊戲顯示主菜單，等待玩家選擇操作
   */
  MENU: 'MENU',
  
  /**
   * 遊戲進行中狀態
   * 玩家正在進行遊戲
   */
  PLAYING: 'PLAYING',
  
  /**
   * 遊戲暫停狀態
   * 遊戲已暫停，等待玩家恢復
   */
  PAUSED: 'PAUSED',
  
  /**
   * 遊戲結束狀態
   * 一局遊戲已經結束，顯示結果和選項
   */
  GAME_OVER: 'GAME_OVER',
  
  /**
   * 設置菜單狀態
   * 玩家正在設置遊戲選項
   */
  SETTINGS: 'SETTINGS',
  
  /**
   * 教學狀態
   * 顯示遊戲操作指南
   */
  TUTORIAL: 'TUTORIAL',
  
  /**
   * 計分板狀態
   * 顯示遊戲的高分榜
   */
  SCOREBOARD: 'SCOREBOARD'
};

export default GameState;
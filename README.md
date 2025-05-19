# 皮卡丘打排球遊戲 - 程式資料夾架構

```
pikachu-volleyball/
│
├── index.html                  # 主要HTML文件，遊戲入口點
├── README.md                   # 專案說明文件
├── LICENSE                     # 授權文件
│
├── assets/                     # 資源文件目錄
│   ├── images/                 # 圖片資源
│   │   ├── sprites/            # 角色精靈圖
│   │   │   ├── pikachu.png     # 皮卡丘精靈圖
│   │   │   └── animations/     # 動畫序列圖
│   │   ├── background/         # 背景圖片
│   │   ├── ui/                 # 界面元素圖片
│   │   └── effects/            # 特效圖片
│   │
│   ├── audio/                  # 音頻資源
│   │   ├── sfx/                # 音效
│   │   │   ├── hit.mp3         # 碰撞音效
│   │   │   ├── jump.mp3        # 跳躍音效
│   │   │   └── score.mp3       # 得分音效
│   │   └── music/              # 背景音樂
│   │       └── theme.mp3       # 主題音樂
│   │
│   └── fonts/                  # 字體文件
│
├── src/                        # 源代碼目錄
│   ├── core/                   # 核心遊戲邏輯
│   │   ├── Game.js             # 遊戲主類
│   │   ├── GameState.js        # 遊戲狀態管理
│   │   └── GameLoop.js         # 遊戲循環實現
│   │
│   ├── models/                 # 遊戲模型
│   │   ├── Pikachu.js          # 皮卡丘類
│   │   ├── Ball.js             # 排球類
│   │   ├── Court.js            # 球場類
│   │   └── GameObject.js        # 遊戲物件基類
│   │
│   ├── physics/                # 物理引擎
│   │   ├── Physics.js          # 物理引擎主類
│   │   ├── Collision.js        # 碰撞檢測
│   │   └── Vector.js           # 向量計算工具
│   │
│   ├── controllers/            # 控制器
│   │   ├── InputHandler.js     # 輸入處理
│   │   ├── KeyboardController.js # 鍵盤控制
│   │   ├── TouchController.js  # 觸控控制
│   │   └── AIController.js     # AI控制器
│   │
│   ├── rendering/              # 渲染系統
│   │   ├── Renderer.js         # 渲染器主類
│   │   ├── Animation.js        # 動畫系統
│   │   ├── Sprite.js           # 精靈圖處理
│   │   └── Effects.js          # 視覺效果
│   │
│   ├── audio/                  # 音頻系統
│   │   ├── SoundManager.js     # 音效管理器
│   │   └── MusicPlayer.js      # 音樂播放器
│   │
│   ├── ui/                     # 用戶界面
│   │   ├── UI.js               # UI管理器
│   │   ├── Menu.js             # 菜單系統
│   │   ├── ScoreBoard.js       # 記分板
│   │   └── Button.js           # 按鈕元素
│   │
│   ├── utils/                  # 工具函數
│   │   ├── Helper.js           # 通用輔助函數
│   │   ├── ResourceLoader.js   # 資源加載器
│   │   ├── EventEmitter.js     # 事件發射器
│   │   └── Debug.js            # 調試工具
│   │
│   └── config/                 # 配置文件
│       ├── GameConfig.js       # 遊戲配置
│       ├── PhysicsConfig.js    # 物理配置
│       └── ControlConfig.js    # 控制配置
│
├── styles/                     # 樣式文件
│   ├── main.css                # 主要CSS
│   ├── ui.css                  # UI樣式
│   └── responsive.css          # 響應式設計
│
└── dist/                       # 打包後的文件 (如果使用構建工具)
    ├── bundle.js               # 打包的JS
    └── styles.css              # 打包的CSS
```

## 文件詳細說明

### 核心文件
- **index.html**: 遊戲主頁面，包含Canvas元素和基本HTML結構
- **src/core/Game.js**: 遊戲核心類，管理遊戲狀態和邏輯
- **src/models/Pikachu.js**: 皮卡丘角色類，定義角色屬性和行為
- **src/models/Ball.js**: 排球類，實現球的物理行為
- **src/physics/Physics.js**: 物理引擎，處理碰撞和運動

### 控制系統
- **src/controllers/InputHandler.js**: 輸入系統的主類，協調不同輸入方式
- **src/controllers/TouchController.js**: 觸控控制實現，支援手機操作
- **src/controllers/KeyboardController.js**: 鍵盤控制實現，支援桌面操作

### 渲染系統
- **src/rendering/Renderer.js**: 負責在Canvas上繪製遊戲元素
- **src/rendering/Animation.js**: 管理動畫序列和過渡

### 用戶界面
- **src/ui/UI.js**: 用戶界面管理器，控制遊戲內菜單和HUD
- **src/ui/ScoreBoard.js**: 記分板實現，追蹤遊戲進度

### 工具和配置
- **src/utils/ResourceLoader.js**: 預加載遊戲資源
- **src/config/GameConfig.js**: 遊戲參數配置，便於調整平衡性

## 設計理念
- **模塊化**: 每個組件有明確的職責，降低耦合度
- **可擴展性**: 易於添加新功能和修改現有功能
- **可維護性**: 清晰的文件結構和命名約定
- **響應式**: 支援不同設備和屏幕尺寸
- **優化性能**: 資源管理和渲染優化

## 觸控控制實現
- 虛擬控制按鈕：在移動設備上顯示虛擬控制器
- 手勢識別：支援滑動和點擊手勢
- 自適應控制：根據設備自動切換控制方式

# duangduang_pet_v0.7_animation_core

这个版本把 duangduang 从“切换几张图”升级为“由动画管理器、状态机和行为系统统一调度”的桌宠原型。当前素材仍以单帧为主，但代码已经支持直接接入序列帧。

## 如何本地打开

直接双击 `index.html` 即可运行工程版。页面不依赖后端，任务、日历和狗毛记录保存在浏览器 `localStorage`。

手机浏览时会自动切换为底部 Dock + 半屏抽屉布局，不再依赖鼠标 hover。

## 项目结构

```text
index.html
assets/duangduang/
src/
  app.js
  state.js
  animations.js
  behavior.js
  tasks.js
  lines.js
  calendar.js
  storage.js
  ui.js
styles/main.css
scripts/build-single.js
dist/duangduang_pet_single.html
```

## 如何添加新动画

在 `src/animations.js` 的 `animationRegistry` 里新增一项：

```js
wave: {
  frames: [
    'assets/duangduang/frames/wave/wave_01.png',
    'assets/duangduang/frames/wave/wave_02.png'
  ],
  fps: 6,
  loop: false,
  priority: 4,
  next: 'currentState'
}
```

业务逻辑里只调用 `animation.playAnimation('wave')` 或 `animation.queueAnimation('wave')`，不要直接改 `petImg.src`。

## 如何替换序列帧

把序列帧放进 `assets/duangduang/frames/动画名/`，例如：

```text
assets/duangduang/frames/walk/walk_01.png
assets/duangduang/frames/walk/walk_02.png
assets/duangduang/frames/walk/walk_03.png
```

然后只替换 `animationRegistry.walk.frames` 数组即可。状态机、点击、拖拽、任务逻辑都不需要改。

## 如何导出单文件 HTML

在项目根目录运行：

```bash
node scripts/build-single.js
```

输出文件是 `dist/duangduang_pet_single.html`。这个文件会内联 CSS、JS 和 PNG 图片，可以直接双击打开。

## 如何在安卓手机上安装

当前项目支持两条路线：

1. PWA 安装：把项目放到 HTTPS 网站或本地局域网服务里，用安卓 Chrome 打开后选择“添加到主屏幕”。相关文件是 `manifest.webmanifest` 和 `service-worker.js`。
2. APK 安装包：使用 `android/` 里的 WebView 工程打包。

准备 APK 工程资源：

```bash
node scripts/prepare-android-webview.js
```

然后用 Android Studio 打开：

```text
C:\Users\35463\Documents\杜望\android
```

选择 `Build > Build Bundle(s) / APK(s) > Build APK(s)`，生成的 APK 通常在：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

当前这台机器没有检测到 Android SDK、Gradle 或 adb，所以我已经准备好安卓工程，但不能在本机直接编译出 `.apk`。

## 如何继续封装 Electron

下一步可以新增一个最小 Electron 壳：

1. 用 `npm init -y` 创建 `package.json`。
2. 安装 Electron：`npm install --save-dev electron`。
3. 新建 `main.js`，创建透明、置顶、无边框窗口并加载 `index.html`。
4. 保留当前 `src/` 和 `assets/` 结构，Electron 只负责窗口能力，不要把动画和任务逻辑搬进主进程。

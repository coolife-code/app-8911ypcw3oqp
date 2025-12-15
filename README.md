## 介绍

**碎念小栈** 🎮 - 一个有趣轻松的互动网站，用户可以在卡片上记录今天的心情、想说的话或想吐槽的内容，系统调用阿里云百炼AI API生成四种不同风格的文本回应，营造像素风格的互动体验。

### ✨ 特色功能

- **AI趣味互动**：坏情绪输入，四倍快乐输出
  - 🔥 黑暗激励：越丧越燃的鼓励话语
  - 💀 毒鸡汤：一针见血的现实感悟
  - 📖 小故事：30字微小说
  - 💎 哲理名言：假装深刻的金句

- **像素美学**：全流程像素风格设计
  - 8-bit复古游戏风格
  - 像素字体和颗粒感视觉
  - 碎纸机切割动画
  - 卡片翻面交互

- **物理堆叠**：卡片自动叠高，营造真实感
  - 支持连续碎纸
  - 第7张时塔体晃动提醒
  - 扑克牌式叠放效果

- **视觉彩蛋**
  - 🐱 背景像素猫动画
  - 🌙 午夜模式（0:00-6:00自动切换霓虹黑配色）
  - ✨ 星星闪烁特效

### 🎨 设计风格

**配色方案**
- 白天模式：米白色背景 + 深蓝色 + 橙红色
- 午夜模式：深紫色背景 + 霓虹蓝绿渐变 + 星星闪烁

**视觉特点**
- 粗线条边框和明显圆角
- 像素字体（Press Start 2P）
- 明显的颗粒感和复古感

### 🎯 使用方法

1. **输入心情**：在卡片中输入你的心情、吐槽或碎碎念（最多200字）
2. **点击碎一下**：点击按钮，卡片被碎纸机切成四张纸条
3. **查看回应**：四张纸条叠放在屏幕中央，点击翻面查看AI生成的内容
4. **继续碎纸**：点击"再碎一张"按钮，继续记录新的心情

### 🎮 交互说明

- **卡片翻面**：点击卡片可以翻面查看内容
- **塔体警告**：堆叠到第7张时会出现晃动和警告提示
- **午夜模式**：每天0:00-6:00自动切换为霓虹黑配色

## 目录结构

```
├── README.md # 说明文档
├── components.json # 组件库配置
├── index.html # 入口文件
├── package.json # 包管理
├── postcss.config.js # postcss 配置
├── public # 静态资源目录
│   ├── favicon.png # 图标
│   └── images # 图片资源
├── src # 源码目录
│   ├── App.tsx # 入口文件
│   ├── components # 组件目录
   │   ├── shred # 碎纸机相关组件
│   │   │   ├── InputCard.tsx # 输入卡片组件
│   │   │   ├── ShredMachine.tsx # 碎纸机动画组件
│   │   │   ├── PaperStrip.tsx # 纸条卡片组件
│   │   │   ├── CardStack.tsx # 卡片堆叠组件
│   │   │   ├── PixelCat.tsx # 像素猫动画组件
│   │   └── ui # shadcn/ui组件库
│   ├── contexts # 上下文目录
│   ├── db # 数据库配置目录
   │   └── HomePage.tsx # 主页面
   │   └── ai.ts # AI服务接口
│   ├── hooks # 通用钩子函数目录
│   ├── index.css # 全局样式
│   ├── layout # 布局目录
│   ├── lib # 工具库目录
│   ├── main.tsx # 入口文件
│   ├── routes.tsx # 路由配置
│   ├── pages # 页面目录
│   ├── services  # 服务目录
│   ├── types   # 类型定义目录
├── tsconfig.app.json  # ts 前端配置文件
├── tsconfig.json # ts 配置文件
├── tsconfig.node.json # ts node端配置文件
└── vite.config.ts # vite 配置文件
```

## 技术栈

- **前端框架**：React 18 + TypeScript + Vite
- **UI组件**：shadcn/ui + Tailwind CSS
- **AI服务**：阿里云百炼 API (qwen-turbo)
- **HTTP客户端**：ky
- **流式处理**：eventsource-parser + streamdown
- **数据库**：Supabase（可选）

## 本地开发

### 如何在本地编辑代码？

您可以选择 [VSCode](https://code.visualstudio.com/Download) 或者您常用的任何 IDE 编辑器，唯一的要求是安装 Node.js 和 npm.

### 环境要求

```
# Node.js ≥ 20
# npm ≥ 10
例如：
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

具体安装步骤如下：

### 在 Windows 上安装 Node.js

```
# Step 1: 访问Node.js官网：https://nodejs.org/，点击下载后，会根据你的系统自动选择合适的版本（32位或64位）。
# Step 2: 运行安装程序：下载完成后，双击运行安装程序。
# Step 3: 完成安装：按照安装向导完成安装过程。
# Step 4: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 在 macOS 上安装 Node.js

```
# Step 1: 使用Homebrew安装（推荐方法）：打开终端。输入命令brew install node并回车。如果尚未安装Homebrew，需要先安装Homebrew，
可以通过在终端中运行如下命令来安装：
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
或者使用官网安装程序：访问Node.js官网。下载macOS的.pkg安装包。打开下载的.pkg文件，按照提示完成安装。
# Step 2: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 安装完后按照如下步骤操作：

```
# Step 1: 下载代码包
# Step 2: 解压代码包
# Step 3: 用IDE打开代码包，进入代码目录
# Step 4: IDE终端输入命令行，安装依赖：npm i
# Step 5: IDE终端输入命令行，启动开发服务器：npm run dev -- --host 127.0.0.1
```

### 如何开发后端服务？

配置环境变量，安装相关依赖
如需使用数据库，请使用 supabase 官方版本或自行部署开源版本的 Supabase

### 如何配置应用中的三方 API？

具体三方 API 调用方法，请参考帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。

## 了解更多

您也可以查看帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。

## 🎨 自定义样式

项目使用Tailwind CSS和自定义CSS变量，可以在 `src/index.css` 中修改：

- **像素风格边框**：`.pixel-border`
- **像素文字**：`.pixel-text`
- **星星闪烁**：`.sparkle-text`
- **卡片翻转**：`.flip-card-*`
- **塔体晃动**：`.tower-wobble`
- **碎纸机动画**：`.shred-animation`

## 📝 API配置

项目使用阿里云百炼AI API，需要在 `src/services/ai.ts` 中配置：

- **API地址**：`https://dashscope.aliyuncs.com/compatible-mode/v1/`
- **API密钥**：在代码中配置（建议使用环境变量）
- **模型**：qwen-turbo
- **响应格式**：JSON对象包含四个文本字段

## 🌟 特别说明

- 像素字体（Press Start 2P）可能需要一些时间加载，已配置回退字体
- 午夜模式会在每天0:00-6:00自动启用
- 建议在桌面浏览器上获得最佳体验
- 移动端也完全支持，响应式设计

## 📄 许可证

© 2025 碎念小栈

---

**把烦恼丢进碎纸机，收获四倍快乐！** ✨

## 🔧 常见问题

### Q: 提示"AI返回格式错误"怎么办？

**原因**：AI返回的内容格式不符合预期。

**解决方法**：
1. 点击"再试一次"按钮重新生成
2. 尝试换一种表达方式输入
3. 打开浏览器开发者工具（F12）查看详细错误信息

系统已经内置了智能格式修复功能，会自动处理大多数格式问题。

### Q: 为什么有时候生成很慢？

**原因**：AI需要时间思考和生成内容。

**正常情况**：
- 通常需要3-10秒
- 网络状况会影响速度
- 输入内容越长，生成时间可能越长

### Q: 午夜模式什么时候启用？

**时间**：每天凌晨0:00-6:00自动启用

**特点**：
- 深紫色背景
- 霓虹蓝绿渐变文字
- 星星闪烁特效

### Q: 卡片堆叠有上限吗？

**提醒**：堆叠到第7张时会出现晃动和警告提示"再高就倒了哦"

**建议**：虽然可以继续堆叠，但为了最佳体验，建议不要超过10张。

## 🐛 调试指南

如果遇到问题，请查看：
- **详细调试文档**：`AI_DEBUG_GUIDE.md`
- **更新日志**：`CHANGELOG.md`

打开浏览器开发者工具（F12）可以看到详细的运行日志。


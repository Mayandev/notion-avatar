# AI 头像生成功能规划文档

> **最后更新**: 2024-12-20  
> **状态**: 🚧 开发中

## 📋 需求理解

### 核心需求
用户希望实现一个功能：**通过 AI 生成 Notion Avatar 手绘风格的头像图片**，支持两种模式。

### 功能要点
1. **Photo2Avatar**：用户上传照片 → AI 转换为手绘风格头像
2. **Text2Avatar**：用户输入文字描述 → AI 生成手绘风格头像
3. **UI 一致性**：新功能的界面风格需与现有网站保持一致
4. **手绘风格**：生成的头像需要保持 Notion Avatar 特有的手绘风格

### Notion Avatar 风格特点（参考图）
基于用户提供的参考图，Notion Avatar 风格具有以下特点：
- **纯黑白配色**：主要使用黑色线条和填充，白色/米白色背景
- **简约线条**：使用简洁的黑色轮廓线勾勒面部轮廓
- **实心填充**：头发等区域使用纯黑色实心填充
- **极简五官**：眼睛用简单形状表示，鼻子用单线，嘴巴用简单曲线
- **卡通比例**：头部较大，面部特征简化但保持辨识度
- **无阴影渐变**：完全扁平化设计，无明暗过渡
- **手绘质感**：线条略带自然的不规则感

### 现有项目技术栈
- **框架**: Next.js 13 (Pages Router)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **国际化**: next-i18next
- **UI 特点**: 
  - 背景色 `#fffefc`
  - 字体 Quicksand
  - 圆角按钮 `rounded-full`
  - 边框样式 `border-3 border-black`
  - 弹窗/Popover 组件已有封装

---

## ✅ 已确认决策

| 问题 | 决策 |
|------|------|
| **AI 服务** | Gemini 2.5 Flash - `gemini-2.0-flash-exp` |
| **用户流程** | 独立新页面 `/ai-generator` |
| **生成模式** | Photo2Avatar + Text2Avatar 双模式 |
| **费用模式** | 每日免费 1 张 + 付费解锁 |
| **开发阶段** | 先使用 Mock API，后续接入真实 API |
| **API Key** | 环境变量 `GEMINI_API_KEY`（后续配置） |

---

## 💡 解决方案

### AI 服务: Gemini 2.5 Flash

Google Gemini 2.5 Flash 支持原生图像生成，可以：
- 根据文本提示生成图像 (Text2Avatar)
- 对现有图像进行风格转换 (Photo2Avatar)

**模型**: `gemini-2.0-flash-exp`  
**SDK**: `@google/genai` (已安装)

```typescript
// Photo2Avatar 示例
const response = await genai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: [
    { text: PHOTO_TO_AVATAR_PROMPT },
    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
  ],
  config: { responseModalities: ['Text', 'Image'] }
});

// Text2Avatar 示例
const response = await genai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: [{ text: `${TEXT_TO_AVATAR_PROMPT}\n\nDescription: ${userDescription}` }],
  config: { responseModalities: ['Text', 'Image'] }
});
```

### Mock API 设计

开发阶段使用 Mock 返回预设图片，便于 UI 开发和测试：

```typescript
// /api/ai/generate-avatar.ts
export default async function handler(req, res) {
  const { mode, image, description } = req.body;
  
  // Mock 模式：延迟 2 秒后返回预设图片
  if (process.env.USE_MOCK_AI === 'true' || !process.env.GEMINI_API_KEY) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return res.json({
      success: true,
      image: MOCK_AVATAR_BASE64, // 预设的 Notion Avatar 图片
      mode: mode
    });
  }
  
  // 真实 API 调用...
}
```

### 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                   前端页面 /ai-generator                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │         模式切换 Tab: [Photo2Avatar] [Text2Avatar]    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ 图片上传/   │ →  │  生成状态   │ →  │ 结果展示/下载   │  │
│  │ 文字输入    │    │  (loading)  │    │                 │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           每日免费次数提示 (1/1) / 付费入口            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Route (Next.js)                        │
│              /api/ai/generate-avatar                         │
├─────────────────────────────────────────────────────────────┤
│  1. 检查 Mock 模式 or 真实 API                               │
│  2. 接收图片(Base64) 或 文字描述                             │
│  3. 调用 Gemini API / 返回 Mock 结果                         │
│  4. 返回生成的图片                                           │
└─────────────────────────────────────────────────────────────┘
```

### Prompt 工程

#### Photo2Avatar Prompt
```
Transform this photo into a Notion Avatar style illustration with these exact characteristics:
- Pure black and white color scheme only
- Simple black outline strokes for facial contours
- Solid black fill for hair (no gradients, no strokes)
- Minimalist facial features: simple shapes for eyes, single line for nose, simple curve for mouth
- Clean white/cream background (#fffefc)
- Cartoon proportions with slightly larger head
- Completely flat design with NO shadows or gradients
- Slight hand-drawn imperfection in lines
- Head and shoulders composition only
- Keep the person's key facial features recognizable but simplified
```

#### Text2Avatar Prompt
```
Generate a Notion Avatar style portrait illustration based on this description:
- Pure black and white color scheme only
- Simple black outline strokes for facial contours  
- Solid black fill for hair (no gradients)
- Minimalist facial features: simple shapes for eyes, single line for nose, simple curve for mouth
- Clean white/cream background (#fffefc)
- Cartoon proportions with slightly larger head
- Completely flat design with NO shadows or gradients
- Slight hand-drawn imperfection in lines
- Head and shoulders composition only

User description: {description}
```

### 每日免费额度实现

```typescript
// src/hooks/useAIUsage.ts
interface DailyUsage {
  date: string;      // YYYY-MM-DD
  count: number;     // 当日已使用次数
}

const FREE_DAILY_LIMIT = 1;
const STORAGE_KEY = 'ai_avatar_usage';

export function useAIUsage() {
  const checkLimit = (): boolean => {
    const today = new Date().toISOString().split('T')[0];
    const usage: DailyUsage = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '{}'
    );
    
    if (usage.date !== today) {
      return true; // 新的一天
    }
    return usage.count < FREE_DAILY_LIMIT;
  };

  const incrementUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const usage: DailyUsage = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '{}'
    );
    
    const newUsage: DailyUsage = {
      date: today,
      count: usage.date === today ? usage.count + 1 : 1
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
  };

  return { checkLimit, incrementUsage, FREE_DAILY_LIMIT };
}
```

---

## 📝 实施拆解

### Phase 1: 基础设施搭建
- [x] 1.1 依赖 `@google/genai` 已安装
- [x] 1.2 创建 AI 生成相关的类型定义 (`src/types/ai.ts`)
- [x] 1.3 创建 Gemini API 封装 + Mock (`src/lib/gemini.ts`)
- [x] 1.4 创建 API Route `/api/ai/generate-avatar`
- [x] 1.5 添加国际化文案 (中/英/其他语言)

### Phase 2: 前端页面开发
- [x] 2.1 创建新页面 `/ai-generator` (`src/pages/ai-generator.tsx`)
- [x] 2.2 创建模式切换 Tab 组件 `ModeSelector`
- [x] 2.3 创建图片上传组件 `ImageUploader`
- [x] 2.4 创建文字输入组件 `TextInput`
- [x] 2.5 创建生成状态组件 `GeneratingStatus`
- [x] 2.6 创建结果展示组件 `GeneratedResult`
- [x] 2.7 创建每日额度提示组件 `DailyLimitBanner`
- [x] 2.8 添加页面导航入口 (Header)

### Phase 3: 功能完善
- [x] 3.1 创建 `useAIUsage` Hook（每日额度检查）
- [x] 3.2 添加错误处理和重试机制
- [x] 3.3 图片压缩优化（上传前压缩）
- [x] 3.4 添加下载功能
- [x] 3.5 添加 AI 生成图标 SVG

### Phase 4: 测试与优化
- [x] 4.1 Mock 模式功能测试 (已验证 API 逻辑)
- [x] 4.2 UI/UX 测试（响应式）
- [ ] 4.3 真实 API 集成测试（用户已配置 Key，待验证）
- [ ] 4.4 Prompt 调优

---

## 📁 文件结构规划

```
src/
├── pages/
│   ├── ai-generator.tsx                # AI 生成独立页面
│   ├── api/
│   │   └── ai/
│   │       └── generate-avatar.ts      # AI 生成 API (支持 Mock)
│   └── components/
│       └── AIGenerator/
│           ├── index.tsx               # 主容器组件
│           ├── ModeSelector.tsx        # Photo/Text 模式切换
│           ├── ImageUploader.tsx       # 图片上传 (Photo2Avatar)
│           ├── TextInput.tsx           # 文字输入 (Text2Avatar)
│           ├── GeneratingStatus.tsx    # 生成状态动画
│           ├── GeneratedResult.tsx     # 结果展示 + 下载
│           └── DailyLimitBanner.tsx    # 每日额度提示
├── hooks/
│   └── useAIUsage.ts                   # AI 使用额度 Hook
├── lib/
│   └── gemini.ts                       # Gemini API 封装 (含 Mock)
└── types/
    └── ai.ts                           # AI 相关类型定义

public/
├── icon/
│   └── ai-magic.svg                    # AI 生成图标
├── mock/
│   └── avatar-sample.png              # Mock 返回的示例头像
└── locales/
    ├── en/common.json                  # 英文文案
    ├── zh/common.json                  # 中文文案
    └── .../                            # 其他语言
```

---

## 🎨 UI 设计规范

为保持与现有网站风格一致：

### 颜色
- 主背景: `#fffefc`
- 边框/文字: `#000000`
- 按钮悬停: `hover:bg-gray-50`
- Tab 激活: `bg-black text-white`

### 按钮样式
```tsx
// 主要按钮（空心）
className="border-3 border-black text-black font-bold py-2 px-4 rounded-full hover:bg-gray-50"

// 次要按钮（实心）
className="bg-black text-white font-bold py-2 px-4 rounded-full hover:bg-gray-800"

// Tab 按钮
className="px-6 py-2 rounded-full border-2 border-black transition-colors"
// 激活态
className="bg-black text-white"
// 非激活态  
className="bg-transparent text-black hover:bg-gray-100"
```

### 上传区域
```tsx
// 拖拽上传区域
className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center 
           hover:border-black transition-colors cursor-pointer"
```

---

## ⚠️ 风险与注意事项

1. **Mock 模式**: 开发阶段使用 Mock，确保 UI 可独立开发测试
2. **生成时间**: 真实 API 需要 5-15 秒，Mock 模拟 2 秒延迟
3. **生成质量**: Prompt 可能需要多次调试
4. **隐私安全**: 用户上传的照片不做服务端持久化存储
5. **错误处理**: 需要友好的错误提示和重试机制

---

## 📊 进度追踪

| 阶段 | 状态 | 开始时间 | 完成时间 | 备注 |
|------|------|----------|----------|------|
| Phase 1 | ⏳ 进行中 | 2024-12-20 | - | 基础设施 |
| Phase 2 | 🔜 待开始 | - | - | 前端页面 |
| Phase 3 | 🔜 待开始 | - | - | 功能完善 |
| Phase 4 | 🔜 待开始 | - | - | 测试优化 |

---

## 📌 当前任务

等待用户确认规划文档后开始实施 Phase 1。

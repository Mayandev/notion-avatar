# AI 生成漏斗转化优化设计

> 日期: 2026-04-17
> 状态: 已批准
> 目标: 提高 AI 头像生成器的免费→付费转化率

## 背景

Notion Avatar Maker 的收入主要来自 Stripe Pro 订阅（$9.99/月），流量以 SEO 自然搜索为主，用户主要使用 AI 头像生成功能。当前免费额度为每周 1 次且无任何下载限制，用户体验价值不足容易流失，付费转化缺乏有效引导。

## 目标

- 让免费用户充分体验 AI 生成的价值（提高留存）
- 在自然节点上引导付费（提高转化率）
- 新增年付计划提高用户 LTV
- 不阻断核心体验（生成 + 下载始终可用）

## 设计方案

### 1. 免费额度提升 + 水印策略

#### 免费额度：1 次/周 → 3 次/周

- 修改 `FREE_WEEKLY_LIMIT` 常量从 1 到 3
- 涉及文件：`src/lib/date.ts`、`src/pages/api/ai/generate-avatar.ts`、`src/pages/api/usage/check.ts`
- 所有 10 个语言的 `common.json` 中涉及额度的文案同步更新

#### 免费用户水印

- 免费用户生成的 AI 头像在**服务端**通过 Sharp 添加水印后返回 base64
- 水印内容：右下角半透明 "notion-avatar.app" 文字/logo
- 水印在 `generate-avatar.ts` 的生成流程中、返回 base64 之前添加
- Pro 用户和使用积分的用户：不添加水印
- 水印资源：`public/watermark.png`（半透明 PNG，约 200x40px）

#### 判断逻辑

```
if (isPaidUser || usingCredits) {
  // 返回无水印原图
} else {
  // Sharp 合成水印后返回
}
```

### 2. 生成结果页优化

#### 变体预览区

- 在 `GeneratedResult` 组件中，下载按钮下方新增变体预览区
- 展示 3-4 张预置的风格变体示例图，使用 CSS `blur(8px)` 模糊处理
- 配文案 "Unlock more styles with Pro"（多语言）
- 点击任意变体图触发 `UpgradeModal`
- 示例图为静态资源，放在 `public/examples/` 目录下，不调用 AI

#### 下载升级提示（非阻断）

- 新组件 `DownloadUpgradePrompt`
- 免费用户点击下载时弹出，展示：
  - 左右对比：带水印 vs 无水印效果
  - "升级 Pro 获取无水印高清版" 按钮
  - 关闭按钮（关闭后继续正常下载带水印版本）
- Pro 用户点击下载时不弹出，直接下载

#### 剩余次数显示

- 在 `GeneratedResult` 区域顶部显示 "本周还剩 X 次免费生成"
- 当 remaining = 0 时：文案变为 "本周额度已用完，下周一重置" + 升级按钮
- 复用 `useAIUsage` hook 的数据

### 3. 年付计划 + 定价优化

#### 新增年付计划

- 价格：$79.99/年（≈ $6.67/月，节省 33%）
- 功能与 Pro Monthly 完全一致
- 新增环境变量 `STRIPE_YEARLY_PRICE_ID`
- 需要在 Stripe Dashboard 预先创建对应 Price

#### Stripe 后端适配

- `create-checkout.ts`：新增 `priceType = 'yearly'`，mode 为 `subscription`，使用 `STRIPE_YEARLY_PRICE_ID`
- `webhook.ts`：确保 `plan_type = 'yearly'` 的订阅事件正确处理，与 monthly 享有同等权限（unlimited）
- `generate-avatar.ts`：yearly 用户与 monthly 同等对待（`plan_type === 'monthly' || plan_type === 'yearly'`）

#### 定价页 UI 调整

- `PricingPlans` 组件：Pro 卡片内加入月付/年付切换开关（Toggle）
- 年付默认选中
- 年付选项旁边显示 "SAVE 33%" 标签
- Credit Pack 卡片保持独立不变

#### UpgradeModal 同步更新

- 弹窗内也展示年付选项
- 默认推荐年付，月付作为备选

### 4. 多语言更新

以下 key 需要在 10 个语言文件中更新或新增：

**更新现有 key：**
- `ai.limitDesc` — 额度从 1 改为 3
- `ai.faq` 相关 — 免费次数说明
- `pricing.plans.free.features` — 更新为 3 次/周

**新增 key：**
- `ai.watermarkHint` — 水印相关提示文案
- `ai.unlockStyles` — 变体预览区文案
- `ai.remainingGenerations` — 剩余次数文案
- `ai.weeklyLimitUsed` — 额度用完文案
- `ai.downloadUpgrade.title` — 下载升级提示标题
- `ai.downloadUpgrade.description` — 下载升级提示描述
- `ai.downloadUpgrade.dismiss` — 关闭按钮文案
- `pricing.plans.pro.yearly` — 年付价格
- `pricing.plans.pro.yearlySave` — 节省百分比文案
- `pricing.toggle.monthly` — 月付切换标签
- `pricing.toggle.yearly` — 年付切换标签

## 不做的事

- 不改变手动 SVG 编辑器的任何行为（保持完全免费）
- 不涉及 API/B2B 方向
- 不涉及新的 AI 生成风格（属于方向 B，后续再做）
- 不改变积分包定价（$4.99/10 credits 保持不变）
- 不添加广告

## 新增静态资源

| 资源 | 路径 | 说明 |
|------|------|------|
| 水印图片 | `public/watermark.png` | 半透明品牌水印，约 200x40px |
| 变体示例图 1-4 | `public/examples/variant-{1..4}.png` | 不同风格的头像示例，用于模糊预览 |

## 新增环境变量

| 变量名 | 说明 |
|--------|------|
| `STRIPE_YEARLY_PRICE_ID` | Stripe 年付订阅的 Price ID |

## 成功标准

- 免费用户的第二次、第三次生成率（衡量留存提升）
- 免费→付费转化率提升
- 年付占新订阅比例 > 30%
- 水印带来的品牌曝光（间接 SEO 效果）

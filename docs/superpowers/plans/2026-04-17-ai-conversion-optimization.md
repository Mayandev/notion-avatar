# AI 生成漏斗转化优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve free-to-paid conversion for the AI avatar generator by increasing free quota with watermarking, adding upgrade nudges on the result page, and introducing a yearly subscription plan.

**Architecture:** Server-side watermark compositing via Sharp in the generate-avatar API. New `DownloadUpgradePrompt` component and variant preview section in `GeneratedResult`. Yearly plan support across Stripe checkout/webhook APIs and pricing UI components. All copy changes across 10 locales.

**Tech Stack:** Next.js 13 (Pages Router), React 18, TypeScript, Tailwind CSS, Sharp, Stripe, Supabase, next-i18next

---

### Task 1: Increase Free Weekly Limit from 1 to 3

**Files:**
- Modify: `src/lib/date.ts:7`
- Modify: `public/locales/en/common.json` (and 9 other locale files)

- [ ] **Step 1: Update the FREE_WEEKLY_LIMIT constant**

In `src/lib/date.ts`, change line 7:

```typescript
/** Free tier weekly generation limit */
export const FREE_WEEKLY_LIMIT = 3;
```

- [ ] **Step 2: Update English locale strings that mention "1 generation"**

In `public/locales/en/common.json`, update these keys:

```json
"pricing.plans.free.features.1" → "3 generations per week"
"ai.faq.a2" → "Free users can generate 3 avatars per week. Upgrade to Pro for unlimited generations."
"pricing.faq.a1" → "Free users get 3 generations per week. Once you've used them, you can either wait until next week, purchase a credit pack, or subscribe to Pro for unlimited access."
"account.freeGenerationPerDay" → "3 free generations per week"
"pricing.upgradeModal.description" → "You've used your free generations for this week. Upgrade to continue creating amazing avatars!"
```

- [ ] **Step 3: Update the other 9 locale files**

Apply equivalent changes in `public/locales/{zh,zh-TW,ja,ko,es,fr,de,ru,pt}/common.json`. Each file's free tier features and FAQ answers need to reflect 3 generations per week.

- [ ] **Step 4: Verify the app builds**

Run: `npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/date.ts public/locales/
git commit -m "feat: increase free weekly limit from 1 to 3 generations"
```

---

### Task 2: Add Server-Side Watermark for Free Users

**Files:**
- Create: `src/lib/watermark.ts`
- Create: `public/watermark.png` (placeholder — must be replaced with real asset)
- Modify: `src/pages/api/ai/generate-avatar.ts:124-211`

- [ ] **Step 1: Create the watermark utility module**

Create `src/lib/watermark.ts`:

```typescript
import sharp from 'sharp';
import path from 'path';

const WATERMARK_PATH = path.join(process.cwd(), 'public', 'watermark.png');

export async function addWatermark(base64Image: string): Promise<string> {
  const imageBuffer = Buffer.from(base64Image, 'base64');
  const metadata = await sharp(imageBuffer).metadata();

  const imgWidth = metadata.width || 512;
  const imgHeight = metadata.height || 512;

  let watermark: Buffer;
  try {
    watermark = await sharp(WATERMARK_PATH)
      .resize({
        width: Math.round(imgWidth * 0.3),
        fit: 'inside',
      })
      .ensureAlpha()
      .composite([
        {
          input: Buffer.from([0, 0, 0, 128]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in',
        },
      ])
      .toBuffer();
  } catch {
    return base64Image;
  }

  const watermarkMeta = await sharp(watermark).metadata();
  const wmWidth = watermarkMeta.width || 100;
  const wmHeight = watermarkMeta.height || 30;

  const result = await sharp(imageBuffer)
    .composite([
      {
        input: watermark,
        gravity: 'southeast',
        top: imgHeight - wmHeight - 10,
        left: imgWidth - wmWidth - 10,
      },
    ])
    .png()
    .toBuffer();

  return result.toString('base64');
}
```

- [ ] **Step 2: Create a placeholder watermark image**

Create a simple SVG-based watermark and convert it. For now, create a text-based PNG using Sharp in a one-off script, or manually place a `public/watermark.png` file (200x40px, white text "notion-avatar.app" on transparent background).

For the placeholder, create `scripts/generate-watermark.ts`:

```typescript
import sharp from 'sharp';
import path from 'path';

const svgText = `<svg width="200" height="40" xmlns="http://www.w3.org/2000/svg">
  <text x="100" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" opacity="0.7">notion-avatar.app</text>
</svg>`;

sharp(Buffer.from(svgText))
  .png()
  .toFile(path.join(process.cwd(), 'public', 'watermark.png'))
  .then(() => console.log('Watermark generated'))
  .catch(console.error);
```

Run: `npx tsx scripts/generate-watermark.ts`
Expected: `public/watermark.png` created

- [ ] **Step 3: Integrate watermark into the generate-avatar API**

In `src/pages/api/ai/generate-avatar.ts`, add the import at the top:

```typescript
import { addWatermark } from '@/lib/watermark';
```

Then modify the section after `const generatedImage = await generateAvatar(mode, input);` (around line 125). Replace the return block at the bottom (lines 208-211) with:

```typescript
    // Apply watermark for free users
    let finalImage = generatedImage;
    if (!isPaidUser) {
      finalImage = await addWatermark(generatedImage);
    }

    return res.status(200).json({
      success: true,
      image: finalImage,
    });
```

- [ ] **Step 4: Verify the API still works**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/lib/watermark.ts scripts/generate-watermark.ts public/watermark.png src/pages/api/ai/generate-avatar.ts
git commit -m "feat: add server-side watermark for free user generations"
```

---

### Task 3: Enhance GeneratedResult with Remaining Count and Variant Previews

**Files:**
- Modify: `src/components/AIGenerator/GeneratedResult.tsx`
- Create: `src/components/AIGenerator/VariantPreviews.tsx`
- Modify: `src/pages/ai-generator.tsx:269-277`
- Modify: `public/locales/en/common.json`

- [ ] **Step 1: Add new locale strings for the result page enhancements**

In `public/locales/en/common.json`, add to the `ai` section:

```json
"ai.remainingGenerations": "{{remaining}} free generations left this week",
"ai.weeklyLimitUsed": "Weekly free quota used up, resets next Monday",
"ai.unlockStyles": "Unlock more styles with Pro",
"ai.watermarkHint": "Free tier includes watermark. Upgrade to Pro for watermark-free downloads."
```

- [ ] **Step 2: Create the VariantPreviews component**

Create `src/components/AIGenerator/VariantPreviews.tsx`:

```tsx
import { useTranslation } from 'next-i18next';

interface VariantPreviewsProps {
  onUpgradeClick: () => void;
}

export default function VariantPreviews({
  onUpgradeClick,
}: VariantPreviewsProps) {
  const { t } = useTranslation('common');

  const variants = [
    '/examples/variant-1.png',
    '/examples/variant-2.png',
    '/examples/variant-3.png',
    '/examples/variant-4.png',
  ];

  return (
    <div className="w-full max-w-md mt-8">
      <p className="text-center text-sm font-medium text-gray-500 mb-3">
        {t('ai.unlockStyles')}
      </p>
      <div className="grid grid-cols-4 gap-3">
        {variants.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={onUpgradeClick}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-black transition-colors cursor-pointer group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Style variant ${i + 1}`}
              className="w-full h-full object-cover blur-[6px] group-hover:blur-[4px] transition-all"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add placeholder variant example images**

Create 4 placeholder images in `public/examples/`. These should be different Notion-style avatar examples. For now, copy any existing avatar images or create simple placeholders:

```bash
mkdir -p public/examples
```

The team will need to replace these with real diverse avatar examples.

- [ ] **Step 4: Update GeneratedResult to accept and display new props**

Replace `src/components/AIGenerator/GeneratedResult.tsx` entirely:

```tsx
import { useTranslation } from 'next-i18next';
import VariantPreviews from './VariantPreviews';

interface GeneratedResultProps {
  image: string;
  onDownload: () => void;
  onReset: () => void;
  remaining?: number;
  total?: number;
  isUnlimited?: boolean;
  isPaidUser?: boolean;
  onUpgradeClick: () => void;
}

export default function GeneratedResult({
  image,
  onDownload,
  onReset,
  remaining,
  total,
  isUnlimited,
  isPaidUser,
  onUpgradeClick,
}: GeneratedResultProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
      {/* Remaining count */}
      {!isUnlimited && remaining !== undefined && (
        <div className={`mb-4 text-sm font-medium px-4 py-2 rounded-full ${
          remaining > 0
            ? 'bg-green-50 text-green-700'
            : 'bg-orange-50 text-orange-700'
        }`}>
          {remaining > 0
            ? t('ai.remainingGenerations', { remaining })
            : t('ai.weeklyLimitUsed')}
          {remaining === 0 && (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="ml-2 underline font-bold hover:no-underline"
            >
              {t('ai.upgrade')}
            </button>
          )}
        </div>
      )}

      <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white rounded-2xl shadow-xl border-4 border-black mb-8 overflow-hidden group">
        <div className="absolute inset-0 bg-[#fffefc] pattern-grid-lg opacity-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Generated Avatar"
          className="w-full h-full object-contain p-4"
        />
      </div>

      {/* Watermark hint for free users */}
      {!isPaidUser && (
        <p className="text-xs text-gray-400 mb-4 text-center">
          {t('ai.watermarkHint')}
        </p>
      )}

      <div className="flex gap-4 w-full max-w-md">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-3 px-6 rounded-full border-3 border-gray-200 text-gray-600 font-bold hover:border-black hover:text-black transition-colors"
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="flex-1 py-3 px-6 rounded-full bg-black text-white font-bold border-3 border-black hover:bg-gray-800 hover:border-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t('ai.download')}
        </button>
      </div>

      {/* Variant previews for free users */}
      {!isPaidUser && <VariantPreviews onUpgradeClick={onUpgradeClick} />}
    </div>
  );
}
```

- [ ] **Step 5: Update ai-generator.tsx to pass new props to GeneratedResult**

In `src/pages/ai-generator.tsx`, modify the `renderContent` function (around line 269-277). Replace the `GeneratedResult` block:

```tsx
    if (generatedImage) {
      const isPaidUser =
        usageState.isUnlimited || (usageState.paidCredits || 0) > 0;
      return (
        <GeneratedResult
          image={generatedImage}
          onDownload={handleDownload}
          onReset={() => setGeneratedImage(null)}
          remaining={usageState.freeRemaining}
          total={usageState.total}
          isUnlimited={usageState.isUnlimited}
          isPaidUser={isPaidUser}
          onUpgradeClick={() => setIsUpgradeModalOpen(true)}
        />
      );
    }
```

- [ ] **Step 6: Verify build**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/components/AIGenerator/GeneratedResult.tsx src/components/AIGenerator/VariantPreviews.tsx src/pages/ai-generator.tsx public/locales/en/common.json public/examples/
git commit -m "feat: add remaining count, watermark hint, and variant previews to result page"
```

---

### Task 4: Add DownloadUpgradePrompt Component

**Files:**
- Create: `src/components/AIGenerator/DownloadUpgradePrompt.tsx`
- Modify: `src/pages/ai-generator.tsx` (handleDownload function)
- Modify: `public/locales/en/common.json`

- [ ] **Step 1: Add locale strings for the download prompt**

In `public/locales/en/common.json`, add to the `ai` section:

```json
"ai.downloadUpgrade.title": "Get Watermark-Free Downloads",
"ai.downloadUpgrade.description": "Upgrade to Pro for high-quality, watermark-free avatar downloads.",
"ai.downloadUpgrade.upgrade": "Upgrade to Pro",
"ai.downloadUpgrade.dismiss": "Download with Watermark"
```

- [ ] **Step 2: Create the DownloadUpgradePrompt component**

Create `src/components/AIGenerator/DownloadUpgradePrompt.tsx`:

```tsx
import { useTranslation } from 'next-i18next';

interface DownloadUpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onDownloadAnyway: () => void;
}

export default function DownloadUpgradePrompt({
  isOpen,
  onClose,
  onUpgrade,
  onDownloadAnyway,
}: DownloadUpgradePromptProps) {
  const { t } = useTranslation('common');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t('ai.downloadUpgrade.title')}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {t('ai.downloadUpgrade.description')}
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onUpgrade}
            className="w-full py-3 px-4 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors"
          >
            {t('ai.downloadUpgrade.upgrade')}
          </button>
          <button
            type="button"
            onClick={onDownloadAnyway}
            className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition-colors"
          >
            {t('ai.downloadUpgrade.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Integrate DownloadUpgradePrompt into ai-generator.tsx**

In `src/pages/ai-generator.tsx`:

Add the import at the top:

```typescript
import DownloadUpgradePrompt from '@/components/AIGenerator/DownloadUpgradePrompt';
```

Add state for the download prompt (after the `isUpgradeModalOpen` state):

```typescript
const [isDownloadPromptOpen, setIsDownloadPromptOpen] = useState(false);
```

Replace the `handleDownload` function (lines 144-152):

```typescript
  const handleDownload = () => {
    if (!generatedImage) return;

    const isPaidUser =
      usageState.isUnlimited || (usageState.paidCredits || 0) > 0;

    if (!isPaidUser && !isDownloadPromptOpen) {
      setIsDownloadPromptOpen(true);
      return;
    }

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `notion-avatar-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloadPromptOpen(false);
  };

  const handleDownloadAnyway = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `notion-avatar-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloadPromptOpen(false);
  };
```

Add the `DownloadUpgradePrompt` component in the JSX (after the `UpgradeModal`):

```tsx
        <DownloadUpgradePrompt
          isOpen={isDownloadPromptOpen}
          onClose={() => setIsDownloadPromptOpen(false)}
          onUpgrade={() => {
            setIsDownloadPromptOpen(false);
            setIsUpgradeModalOpen(true);
          }}
          onDownloadAnyway={handleDownloadAnyway}
        />
```

- [ ] **Step 4: Verify build**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/AIGenerator/DownloadUpgradePrompt.tsx src/pages/ai-generator.tsx public/locales/en/common.json
git commit -m "feat: add non-blocking download upgrade prompt for free users"
```

---

### Task 5: Add Yearly Subscription Plan — Backend

**Files:**
- Modify: `src/pages/api/stripe/create-checkout.ts:71-98`
- Modify: `src/pages/api/stripe/webhook.ts:61-101,136-191`
- Modify: `src/pages/api/ai/generate-avatar.ts:65-68`
- Modify: `src/pages/api/usage/check.ts:38-41`

- [ ] **Step 1: Update create-checkout.ts to support yearly plan**

In `src/pages/api/stripe/create-checkout.ts`, replace the price ID determination block (lines 71-79):

```typescript
    // Determine the price ID and mode based on type
    let priceId: string | undefined;
    let checkoutMode: 'subscription' | 'payment';

    if (priceType === 'monthly') {
      priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
      checkoutMode = 'subscription';
    } else if (priceType === 'yearly') {
      priceId = process.env.STRIPE_YEARLY_PRICE_ID;
      checkoutMode = 'subscription';
    } else {
      priceId = process.env.STRIPE_CREDITS_PRICE_ID;
      checkoutMode = 'payment';
    }

    if (!priceId) {
      return res.status(500).json({ error: 'Price not configured' });
    }
```

Also update the checkout session creation (lines 82-98) to use `checkoutMode`:

```typescript
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: checkoutMode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/ai-generator?success=true`,
      cancel_url: `${req.headers.origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        price_type: priceType,
      },
    });
```

And update the comment on the request body line (line 27):

```typescript
    const { priceType } = req.body; // 'monthly', 'yearly', or 'credits'
```

- [ ] **Step 2: Update webhook.ts to handle yearly subscriptions**

In `src/pages/api/stripe/webhook.ts`, modify the checkout.session.completed handler (around line 61). Replace the condition:

```typescript
        if ((priceType === 'monthly' || priceType === 'yearly') && session.subscription) {
```

And update the plan_type in the upsert (around line 89):

```typescript
                plan_type: priceType === 'yearly' ? 'yearly' : 'monthly',
```

In the `customer.subscription.updated` handler (around line 161-179), update the status logic to handle yearly:

```typescript
        if (
          subscriptionData.status === 'active' &&
          !isExpired &&
          !subscriptionData.cancel_at_period_end
        ) {
          status = 'active';
          planType = subscriptionData.plan?.interval === 'year' ? 'yearly' : 'monthly';
        } else if (subscriptionData.status === 'active' && isExpired) {
          status = 'canceled';
          planType = 'free';
        } else if (
          subscriptionData.status === 'active' &&
          subscriptionData.cancel_at_period_end
        ) {
          status = 'active';
          planType = subscriptionData.plan?.interval === 'year' ? 'yearly' : 'monthly';
        }
```

- [ ] **Step 3: Update generate-avatar.ts to treat yearly same as monthly**

In `src/pages/api/ai/generate-avatar.ts`, replace the subscription check (lines 65-68):

```typescript
      if (
        (subscription?.plan_type === 'monthly' ||
          subscription?.plan_type === 'yearly') &&
        subscription?.status === 'active'
      ) {
```

Also update the same check in the daily usage recording section (lines 176-180):

```typescript
      if (
        !(
          (subscription?.plan_type === 'monthly' ||
            subscription?.plan_type === 'yearly') &&
          subscription?.status === 'active'
        )
      ) {
```

- [ ] **Step 4: Update usage/check.ts to treat yearly same as monthly**

In `src/pages/api/usage/check.ts`, replace the subscription check (lines 38-41):

```typescript
    if (
      (subscription?.plan_type === 'monthly' ||
        subscription?.plan_type === 'yearly') &&
      subscription?.status === 'active'
    ) {
```

And update the planType in the unlimited response (line 70):

```typescript
        planType: subscription?.plan_type,
```

- [ ] **Step 5: Verify build**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/pages/api/stripe/create-checkout.ts src/pages/api/stripe/webhook.ts src/pages/api/ai/generate-avatar.ts src/pages/api/usage/check.ts
git commit -m "feat: add yearly subscription support in Stripe backend"
```

---

### Task 6: Add Yearly Plan to Pricing UI

**Files:**
- Modify: `src/components/Pricing/PricingPlans.tsx`
- Modify: `src/pages/pricing.tsx`
- Modify: `src/pages/ai-generator.tsx` (plans definition)
- Modify: `public/locales/en/common.json`

- [ ] **Step 1: Add locale strings for yearly plan and billing toggle**

In `public/locales/en/common.json`, add to the `pricing` section:

```json
"pricing.toggle.monthly": "Monthly",
"pricing.toggle.yearly": "Yearly",
"pricing.plans.pro.yearlyPrice": "$79.99",
"pricing.plans.pro.yearlyPeriod": "per year",
"pricing.plans.pro.yearlySave": "SAVE 33%",
"pricing.plans.pro.yearlyEquivalent": "$6.67/mo"
```

- [ ] **Step 2: Update PricingPlans component with billing toggle**

In `src/components/Pricing/PricingPlans.tsx`, update the `Plan` interface to include optional yearly fields:

```typescript
interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
  priceType: string | null;
  popular?: boolean;
  yearlyPrice?: string;
  yearlyPeriod?: string;
  yearlySave?: string;
  yearlyEquivalent?: string;
  yearlyPriceType?: string;
}
```

Add a `billingCycle` state and toggle UI. Add to the component body after `const [loadingPlan, ...]`:

```typescript
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
```

Add the toggle UI before the grid div (after the title/description section). In the return JSX, after the closing `</div>` of the title block and before `<div className="grid md:grid-cols-3 ...">`:

```tsx
      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span
          className={`text-sm font-medium ${
            billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {t('pricing.toggle.monthly')}
        </span>
        <button
          type="button"
          onClick={() =>
            setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')
          }
          className={`relative w-12 h-6 rounded-full transition-colors ${
            billingCycle === 'yearly' ? 'bg-black' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${
            billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {t('pricing.toggle.yearly')}
        </span>
      </div>
```

Update the plan card price display to show yearly when applicable. Inside the price section of each card, replace the price/period display:

```tsx
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  {billingCycle === 'yearly' && plan.yearlyPrice
                    ? plan.yearlyPrice
                    : plan.price}
                </span>
                <span className="text-gray-500">
                  /
                  {billingCycle === 'yearly' && plan.yearlyPeriod
                    ? plan.yearlyPeriod
                    : plan.period}
                </span>
              </div>
              {billingCycle === 'yearly' && plan.yearlyEquivalent && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  {plan.yearlyEquivalent}
                </p>
              )}
```

Add the save badge next to the popular badge for the Pro card:

```tsx
            {plan.popular && billingCycle === 'yearly' && plan.yearlySave && (
              <div className="absolute -top-4 right-4">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.yearlySave}
                </span>
              </div>
            )}
```

Update `handleSelectPlan` to use yearly priceType:

```typescript
  const handleSelectPlan = async (plan: Plan) => {
    const priceType =
      billingCycle === 'yearly' && plan.yearlyPriceType
        ? plan.yearlyPriceType
        : plan.priceType;

    if (!priceType) return;
```

And update the button onClick to pass the full plan: `onClick={() => handleSelectPlan(plan)}`

Update `isCurrentPlan` to also check for yearly:

```typescript
    if (
      (planName === t('pricing.plans.pro.name') ||
        planName === 'Pro Monthly') &&
      (subscription?.plan_type === 'monthly' ||
        subscription?.plan_type === 'yearly') &&
      subscription?.status === 'active'
    ) {
      return true;
    }
```

- [ ] **Step 3: Update pricing.tsx plans definition to include yearly data**

In `src/pages/pricing.tsx`, add yearly fields to the Pro plan (around line 46-63):

```typescript
      {
        name: t('pricing.plans.pro.name'),
        price: t('pricing.plans.pro.price'),
        period: t('pricing.plans.pro.period'),
        description: t('pricing.plans.pro.description'),
        features: [
          t('pricing.plans.pro.features.1'),
          t('pricing.plans.pro.features.2'),
          t('pricing.plans.pro.features.3'),
          t('pricing.plans.pro.features.4'),
          t('pricing.plans.pro.features.5'),
          t('pricing.plans.pro.features.6'),
          t('pricing.plans.pro.features.7'),
        ],
        buttonText: t('pricing.plans.pro.buttonText'),
        buttonVariant: 'primary' as const,
        priceType: 'monthly',
        popular: true,
        yearlyPrice: t('pricing.plans.pro.yearlyPrice'),
        yearlyPeriod: t('pricing.plans.pro.yearlyPeriod'),
        yearlySave: t('pricing.plans.pro.yearlySave'),
        yearlyEquivalent: t('pricing.plans.pro.yearlyEquivalent'),
        yearlyPriceType: 'yearly',
      },
```

- [ ] **Step 4: Apply the same yearly fields to the plans definition in ai-generator.tsx**

In `src/pages/ai-generator.tsx`, add the same yearly fields to the Pro plan in the `plans` useMemo (around line 226-242):

```typescript
        yearlyPrice: t('pricing.plans.pro.yearlyPrice'),
        yearlyPeriod: t('pricing.plans.pro.yearlyPeriod'),
        yearlySave: t('pricing.plans.pro.yearlySave'),
        yearlyEquivalent: t('pricing.plans.pro.yearlyEquivalent'),
        yearlyPriceType: 'yearly',
```

- [ ] **Step 5: Verify build**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add src/components/Pricing/PricingPlans.tsx src/pages/pricing.tsx src/pages/ai-generator.tsx public/locales/en/common.json
git commit -m "feat: add yearly plan toggle to pricing page and AI generator"
```

---

### Task 7: Add Yearly Plan to UpgradeModal

**Files:**
- Modify: `src/components/Pricing/UpgradeModal.tsx`
- Modify: `public/locales/en/common.json`

- [ ] **Step 1: Add locale strings for yearly option in upgrade modal**

In `public/locales/en/common.json`, add to `pricing.upgradeModal`:

```json
"pricing.upgradeModal.proYearly": "Pro Yearly",
"pricing.upgradeModal.proYearlyPrice": "$79.99",
"pricing.upgradeModal.proYearlyPeriod": "/year",
"pricing.upgradeModal.proYearlySave": "Save 33%",
"pricing.upgradeModal.recommended": "Recommended"
```

- [ ] **Step 2: Update UpgradeModal to include yearly option**

In `src/components/Pricing/UpgradeModal.tsx`, update `handlePurchase` type:

```typescript
  const handlePurchase = async (priceType: 'monthly' | 'yearly' | 'credits') => {
```

Add the yearly subscription button between the Pro Monthly and Credit Pack buttons in the `<div className="space-y-4">` section. Replace the entire Pro Monthly button and add yearly before it:

```tsx
          {/* Pro Yearly - Recommended */}
          <button
            onClick={() => handlePurchase('yearly')}
            disabled={isLoading !== null}
            type="button"
            className="w-full p-4 border-2 border-black rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">
                    {t('pricing.upgradeModal.proYearly')}
                  </span>
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {t('pricing.upgradeModal.recommended')}
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {t('pricing.upgradeModal.proYearlySave')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {t('pricing.upgradeModal.unlimitedGenerations')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {t('pricing.upgradeModal.proYearlyPrice')}
                </span>
                <span className="text-gray-500 text-sm">
                  {t('pricing.upgradeModal.proYearlyPeriod')}
                </span>
              </div>
            </div>
            {isLoading === 'yearly' && (
              <div className="mt-2 text-center text-sm text-gray-500">
                {t('pricing.upgradeModal.redirecting')}
              </div>
            )}
          </button>

          {/* Pro Monthly */}
          <button
            onClick={() => handlePurchase('monthly')}
            disabled={isLoading !== null}
            type="button"
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">
                  {t('pricing.upgradeModal.proMonthly')}
                </span>
                <p className="text-gray-600 text-sm mt-1">
                  {t('pricing.upgradeModal.unlimitedGenerations')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {t('pricing.upgradeModal.proPrice')}
                </span>
                <span className="text-gray-500 text-sm">
                  {t('pricing.upgradeModal.proPeriod')}
                </span>
              </div>
            </div>
            {isLoading === 'monthly' && (
              <div className="mt-2 text-center text-sm text-gray-500">
                {t('pricing.upgradeModal.redirecting')}
              </div>
            )}
          </button>
```

Remove the "Best Value" badge from the monthly button since yearly is now recommended.

- [ ] **Step 3: Verify build**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/Pricing/UpgradeModal.tsx public/locales/en/common.json
git commit -m "feat: add yearly plan option to upgrade modal"
```

---

### Task 8: Update All Non-English Locale Files

**Files:**
- Modify: `public/locales/{zh,zh-TW,ja,ko,es,fr,de,ru,pt}/common.json`

- [ ] **Step 1: Add all new keys to zh/common.json**

Add the following keys (translated to Chinese) to `public/locales/zh/common.json`:

```json
"ai.remainingGenerations": "本周剩余 {{remaining}} 次免费生成",
"ai.weeklyLimitUsed": "本周免费额度已用完，下周一重置",
"ai.unlockStyles": "升级 Pro 解锁更多风格",
"ai.watermarkHint": "免费版包含水印，升级 Pro 获取无水印下载。",
"ai.downloadUpgrade.title": "获取无水印下载",
"ai.downloadUpgrade.description": "升级 Pro 享受高清无水印头像下载。",
"ai.downloadUpgrade.upgrade": "升级 Pro",
"ai.downloadUpgrade.dismiss": "下载带水印版本",
"pricing.toggle.monthly": "月付",
"pricing.toggle.yearly": "年付",
"pricing.plans.pro.yearlyPrice": "$79.99",
"pricing.plans.pro.yearlyPeriod": "每年",
"pricing.plans.pro.yearlySave": "省33%",
"pricing.plans.pro.yearlyEquivalent": "$6.67/月",
"pricing.upgradeModal.proYearly": "Pro 年付",
"pricing.upgradeModal.proYearlyPrice": "$79.99",
"pricing.upgradeModal.proYearlyPeriod": "/年",
"pricing.upgradeModal.proYearlySave": "省33%",
"pricing.upgradeModal.recommended": "推荐"
```

Also update existing keys about the free tier limit (1 → 3).

- [ ] **Step 2: Repeat for zh-TW**

Apply Traditional Chinese translations for the same keys.

- [ ] **Step 3: Repeat for ja**

Apply Japanese translations.

- [ ] **Step 4: Repeat for ko**

Apply Korean translations.

- [ ] **Step 5: Repeat for es**

Apply Spanish translations.

- [ ] **Step 6: Repeat for fr**

Apply French translations.

- [ ] **Step 7: Repeat for de**

Apply German translations.

- [ ] **Step 8: Repeat for ru**

Apply Russian translations.

- [ ] **Step 9: Repeat for pt**

Apply Portuguese translations.

- [ ] **Step 10: Verify build**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 11: Commit**

```bash
git add public/locales/
git commit -m "feat: add translations for watermark, yearly plan, and download prompt across all locales"
```

---

### Task 9: Final Verification and Cleanup

**Files:**
- Verify all modified files

- [ ] **Step 1: Run full build**

Run: `npx next build`
Expected: Build completes successfully

- [ ] **Step 2: Run lint check**

Run: `npx next lint`
Expected: No new lint errors

- [ ] **Step 3: Verify env var documentation**

Confirm `.env.example` or similar includes `STRIPE_YEARLY_PRICE_ID`. If no `.env.example` exists, add a note in the README or create one.

- [ ] **Step 4: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore: final cleanup for conversion optimization feature"
```

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/contexts/AuthContext';

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

interface PricingPlansProps {
  plans: Plan[];
  title?: string;
  description?: string;
  onAuthRequired?: () => void;
}

export default function PricingPlans({
  plans,
  title,
  description,
  onAuthRequired,
}: PricingPlansProps) {
  const { t } = useTranslation('common');
  const { user, subscription } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'yearly',
  );

  const checkoutPriceType = (plan: Plan) =>
    billingCycle === 'yearly' && plan.yearlyPriceType
      ? plan.yearlyPriceType
      : plan.priceType;

  const handleSelectPlan = async (plan: Plan) => {
    const priceType = checkoutPriceType(plan);

    if (!priceType) return;

    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    setLoadingPlan(priceType);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceType }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch {
      toast.error(t('pricing.checkoutError'));
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planName: string) => {
    if (
      (planName === t('pricing.plans.free.name') || planName === 'Free') &&
      (!subscription || subscription.plan_type === 'free')
    ) {
      return true;
    }
    if (
      (planName === t('pricing.plans.pro.name') ||
        planName === 'Pro Monthly') &&
      (subscription?.plan_type === 'monthly' ||
        subscription?.plan_type === 'yearly') &&
      subscription?.status === 'active'
    ) {
      return true;
    }
    return false;
  };

  return (
    <div>
      {(title || description) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          )}
          {description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

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

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-2xl shadow-lg border-3 p-8 flex flex-col ${
              plan.popular ? 'border-black scale-105' : 'border-gray-100'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-black text-white text-sm font-medium px-4 py-1 rounded-full">
                  {t('pricing.plans.pro.popular')}
                </span>
              </div>
            )}
            {plan.popular && billingCycle === 'yearly' && plan.yearlySave && (
              <div className="absolute -top-4 right-4">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.yearlySave}
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
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
              <p className="text-gray-600 mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={
                isCurrentPlan(plan.name) ||
                (loadingPlan !== null &&
                  loadingPlan === checkoutPriceType(plan))
              }
              type="button"
              className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
                isCurrentPlan(plan.name)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : plan.buttonVariant === 'primary'
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-white text-black border-2 border-black hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {loadingPlan !== null && loadingPlan === checkoutPriceType(plan)
                ? t('pricing.loading')
                : isCurrentPlan(plan.name)
                ? t('pricing.currentPlan')
                : plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

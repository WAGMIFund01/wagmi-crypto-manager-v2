'use client';

import { WagmiButton, DevIcon, ManagerIcon, RefreshIcon, EyeIcon, SignOutIcon } from '@/components/ui';

export default function ButtonDemo() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">WagmiButton Component Demo</h1>
        
        {/* Primary Buttons */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Primary Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <WagmiButton variant="primary" theme="green" size="sm">
              Small Green
            </WagmiButton>
            <WagmiButton variant="primary" theme="green" size="md">
              Medium Green
            </WagmiButton>
            <WagmiButton variant="primary" theme="green" size="lg">
              Large Green
            </WagmiButton>
            <WagmiButton variant="primary" theme="orange" size="md">
              Orange Primary
            </WagmiButton>
            <WagmiButton variant="primary" theme="blue" size="md">
              Blue Primary
            </WagmiButton>
            <WagmiButton variant="primary" theme="red" size="md">
              Red Primary
            </WagmiButton>
            <WagmiButton variant="primary" theme="gray" size="md">
              Gray Primary
            </WagmiButton>
          </div>
        </section>

        {/* Outline Buttons */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Outline Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <WagmiButton variant="outline" theme="green" size="sm">
              Small Green
            </WagmiButton>
            <WagmiButton variant="outline" theme="green" size="md">
              Medium Green
            </WagmiButton>
            <WagmiButton variant="outline" theme="green" size="lg">
              Large Green
            </WagmiButton>
            <WagmiButton variant="outline" theme="orange" size="md">
              Orange Outline
            </WagmiButton>
            <WagmiButton variant="outline" theme="blue" size="md">
              Blue Outline
            </WagmiButton>
            <WagmiButton variant="outline" theme="red" size="md">
              Red Outline
            </WagmiButton>
            <WagmiButton variant="outline" theme="gray" size="md">
              Gray Outline
            </WagmiButton>
          </div>
        </section>

        {/* Ghost Buttons */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Ghost Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <WagmiButton variant="ghost" theme="green" size="sm">
              Small Green
            </WagmiButton>
            <WagmiButton variant="ghost" theme="green" size="md">
              Medium Green
            </WagmiButton>
            <WagmiButton variant="ghost" theme="green" size="lg">
              Large Green
            </WagmiButton>
            <WagmiButton variant="ghost" theme="orange" size="md">
              Orange Ghost
            </WagmiButton>
            <WagmiButton variant="ghost" theme="blue" size="md">
              Blue Ghost
            </WagmiButton>
            <WagmiButton variant="ghost" theme="red" size="md">
              Red Ghost
            </WagmiButton>
            <WagmiButton variant="ghost" theme="gray" size="md">
              Gray Ghost
            </WagmiButton>
          </div>
        </section>

        {/* Icon-Only Buttons */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Icon-Only Buttons (size=&quot;icon&quot;)</h2>
          <div className="flex flex-wrap gap-4">
            <WagmiButton variant="outline" theme="green" size="icon" icon={<RefreshIcon className="w-3 h-3" />} />
            <WagmiButton variant="primary" theme="green" size="icon" icon={<EyeIcon className="w-3 h-3" />} />
            <WagmiButton variant="outline" theme="orange" size="icon" icon={<DevIcon className="w-3 h-3" />} />
            <WagmiButton variant="outline" theme="blue" size="icon" icon={<ManagerIcon className="w-3 h-3" />} />
            <WagmiButton variant="outline" theme="red" size="icon" icon={<SignOutIcon className="w-3 h-3" />} />
            <WagmiButton variant="outline" theme="gray" size="icon" icon={<RefreshIcon className="w-3 h-3" />} />
          </div>
        </section>

        {/* Buttons with Icons (Different Sizes) */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Buttons with Icons (Different Sizes)</h2>
          <div className="flex flex-wrap gap-4">
            <WagmiButton variant="outline" theme="green" size="sm" icon={<DevIcon />}>Small</WagmiButton>
            <WagmiButton variant="outline" theme="green" size="md" icon={<ManagerIcon />}>Medium</WagmiButton>
            <WagmiButton variant="outline" theme="green" size="lg" icon={<RefreshIcon />}>Large</WagmiButton>
            <WagmiButton variant="primary" theme="orange" size="md" icon={<DevIcon />}>Orange</WagmiButton>
            <WagmiButton variant="primary" theme="blue" size="md" icon={<EyeIcon />}>Blue</WagmiButton>
            <WagmiButton variant="primary" theme="red" size="md" icon={<SignOutIcon />}>Red</WagmiButton>
          </div>
        </section>

        {/* Real Usage Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Real Usage Examples</h2>
          <div className="flex flex-wrap gap-4">
            <WagmiButton variant="outline" theme="orange" icon={<DevIcon />}>
              Dev Access
            </WagmiButton>
            <WagmiButton variant="outline" theme="green" icon={<ManagerIcon />}>
              Manager Access
            </WagmiButton>
            <WagmiButton variant="primary" theme="green" icon={<RefreshIcon />} iconPosition="right">
              Refresh Data
            </WagmiButton>
            <WagmiButton variant="ghost" theme="blue" icon={<EyeIcon />}>
              Toggle Privacy
            </WagmiButton>
          </div>
        </section>

        {/* Loading States */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Loading States</h2>
          <div className="flex flex-wrap gap-4">
            <WagmiButton variant="primary" theme="green" loading>
              Loading...
            </WagmiButton>
            <WagmiButton variant="outline" theme="orange" loading>
              Processing...
            </WagmiButton>
            <WagmiButton variant="icon" theme="green" loading />
            <WagmiButton variant="primary" theme="green" disabled>
              Disabled
            </WagmiButton>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Real-world Examples</h2>
          <div className="flex flex-wrap gap-4">
            <WagmiButton variant="outline" theme="orange" icon={<DevIcon />} size="lg">
              Dev Access
            </WagmiButton>
            <WagmiButton variant="outline" theme="green" icon={<ManagerIcon />} size="lg">
              Manager Access
            </WagmiButton>
            <WagmiButton variant="outline" theme="green" icon={<RefreshIcon className="w-3 h-3" />} size="icon" />
            <WagmiButton variant="outline" theme="blue" icon={<EyeIcon className="w-3 h-3" />} size="icon" />
            <WagmiButton variant="outline" theme="red" icon={<SignOutIcon className="w-3 h-3" />} size="icon" />
          </div>
        </section>
      </div>
    </div>
  );
}

import { useState } from 'react';

import { Save } from 'lucide-react';
import { CategoriesManager } from '../../components/settings';
import { Button } from '../../components/ui/button/Button';
import { Input } from '../../components/ui/Input/Input';
import { Label } from '../../components/ui/typography/Label';
import { useSettings, useBaselineMutation, useFixedCostMutation } from '../../hooks/useSettings';

type SettingsTab = 'general' | 'categories';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { settings, isLoading } = useSettings();
  const { updateBaseline, isPending: isBaselinePending, error: baselineError } = useBaselineMutation();
  const { updateFixedCost, isPending: isFixedCostPending, error: fixedCostError } = useFixedCostMutation();

  // If settings are still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleSaveBaseline = async (value: number) => {
    try {
      await updateBaseline(value);
      alert('Settings saved');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const handleSaveFixedCost = async (value: number) => {
    try {
      await updateFixedCost(value);
      alert('Settings saved');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-500 mt-1">Configure application settings and master data</p>
      </div>

      <div className="flex border-b border-neutral-200">
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'general'
            ? 'border-primary text-primary'
            : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'categories'
            ? 'border-primary text-primary'
            : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          onClick={() => setActiveTab('categories')}
        >
          Categories (Master Data)
        </button>
      </div>

      <div className="pt-4">
        {activeTab === 'general' && (
          <div className="max-w-md space-y-6 p-4 bg-white rounded-lg border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Dashboard Configuration</h2>
            <BaselineForm
              initialValue={settings.baseline_amount}
              onSave={handleSaveBaseline}
              isPending={isBaselinePending}
              error={baselineError}
            />
            <FixedCostForm
              initialValue={settings.fixed_cost}
              onSave={handleSaveFixedCost}
              isPending={isFixedCostPending}
              error={fixedCostError}
            />
          </div>
        )}

        {activeTab === 'categories' && <CategoriesManager />}
      </div>
    </div>
  );
}

// Separate component to handle form state with proper initialization
interface BaselineFormProps {
  initialValue: number;
  onSave: (value: number) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

function BaselineForm({ initialValue, onSave, isPending, error }: BaselineFormProps) {
  // Initialize from props only on mount
  const [baselineValue, setBaselineValue] = useState<string>(initialValue.toString());

  const handleSave = () => {
    const value = parseFloat(baselineValue);
    void onSave(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="baseline">Baseline Value</Label>
      <Input
        id="baseline"
        type="number"
        value={baselineValue}
        onChange={(e) => setBaselineValue(e.target.value)}
        placeholder="5000"
        disabled={isPending}
      />
      <p className="text-xs text-neutral-500">
        Minimum cash threshold for danger zone warning.
      </p>
      {error && (
        <p className="text-xs text-error">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      )}
      <div className="pt-2">
        <Button onClick={handleSave} leftIcon={<Save size={16} />} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

interface FixedCostFormProps {
  initialValue: number;
  onSave: (value: number) => Promise<void>;
  isPending: boolean;
  error: Error | null;
}

function FixedCostForm({ initialValue, onSave, isPending, error }: FixedCostFormProps) {
  // Initialize from props only on mount
  const [fixedCostValue, setFixedCostValue] = useState<string>(initialValue.toString());

  const handleSave = () => {
    const value = parseFloat(fixedCostValue);
    void onSave(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="fixed-cost">Monthly Fixed Cost</Label>
      <Input
        id="fixed-cost"
        type="number"
        value={fixedCostValue}
        onChange={(e) => setFixedCostValue(e.target.value)}
        placeholder="0"
        disabled={isPending}
      />
      <p className="text-xs text-neutral-500">
        Monthly fixed operating costs (rent, salaries, subscriptions) used for runway calculation.
      </p>
      {error && (
        <p className="text-xs text-error">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
      )}
      <div className="pt-2">
        <Button onClick={handleSave} leftIcon={<Save size={16} />} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

export { SettingsPage };

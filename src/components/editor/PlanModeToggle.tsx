'use client';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { Switch } from '@/components/ui/switch';

export function PlanModeToggle() {
  const planMode = useEditorStore((s) => s.planMode);
  const setPlanMode = useEditorStore((s) => s.setPlanMode);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <Switch
        checked={planMode}
        onCheckedChange={setPlanMode}
        id="plan-mode"
        className="data-[state=checked]:bg-[#cba6f7]"
      />
      <label htmlFor="plan-mode" className="text-xs text-[#a6adc8] cursor-pointer select-none">
        Plan Mode
      </label>
    </div>
  );
}

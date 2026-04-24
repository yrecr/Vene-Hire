import { CircleCheck, CircleX, CirclePause } from 'lucide-react';

interface ProcessTimelineProps {
  currentStage: 'intro_interview' | 'technical_interview' | 'contract_signing';
  status: 'active' | 'hired' | 'not_selected' | 'on_hold';
  introDate?: string | null;
  technicalDate?: string | null;
  contractStatus?: 'pending' | 'under_review' | 'signed' | null;
}

const stages = [
  { key: 'intro_interview', label: 'Intro Interview' },
  { key: 'technical_interview', label: 'Technical Interview' },
  { key: 'contract_signing', label: 'Contract Signing' },
] as const;

function getStageIndex(stage: string): number {
  return stages.findIndex((s) => s.key === stage);
}

function formatDate(date: string | null | undefined): string | null {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export function ProcessTimeline({
  currentStage,
  status,
  introDate,
  technicalDate,
  contractStatus,
}: ProcessTimelineProps) {
  const currentIndex = getStageIndex(currentStage);

  function getStepDate(index: number): string | null {
    if (index === 0) return formatDate(introDate);
    if (index === 1) return formatDate(technicalDate);
    if (index === 2 && contractStatus) {
      const labels: Record<string, string> = {
        pending: 'Pending',
        under_review: 'Under Review',
        signed: 'Signed',
      };
      return labels[contractStatus] || null;
    }
    return null;
  }

  function getStepState(index: number): 'completed' | 'current' | 'future' {
    if (status === 'hired') return 'completed';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'future';
  }

  function renderIcon(index: number) {
    const stepState = getStepState(index);
    const stepNumber = index + 1;

    if (stepState === 'completed') {
      return (
        <CircleCheck className="w-8 h-8 text-emerald-500" />
      );
    }

    if (stepState === 'current') {
      if (status === 'not_selected') {
        return <CircleX className="w-8 h-8 text-red-500" />;
      }
      if (status === 'on_hold') {
        return <CirclePause className="w-8 h-8 text-amber-500" />;
      }
      return (
        <div className="w-8 h-8 rounded-full bg-[hsl(210,100%,45%)] text-white flex items-center justify-center text-sm font-semibold">
          {stepNumber}
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-full border-2 border-gray-300" />
    );
  }

  function getLineColor(index: number): string {
    const leftState = getStepState(index);
    const rightState = getStepState(index + 1);

    if (leftState === 'completed' && rightState === 'completed') {
      return 'bg-emerald-400';
    }
    if (leftState === 'completed' && rightState === 'current') {
      if (status === 'not_selected') return 'bg-red-300';
      if (status === 'on_hold') return 'bg-amber-300';
      return 'bg-[hsl(210,100%,45%)]/40';
    }
    return 'bg-gray-200';
  }

  function getLabelColor(index: number): string {
    const stepState = getStepState(index);
    if (stepState === 'completed') return 'text-emerald-700';
    if (stepState === 'current') {
      if (status === 'not_selected') return 'text-red-700';
      if (status === 'on_hold') return 'text-amber-700';
      return 'text-[hsl(210,100%,45%)]';
    }
    return 'text-gray-400';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.key} className="flex items-center flex-1 last:flex-none">
            {/* Step */}
            <div className="flex flex-col items-center">
              {renderIcon(index)}
              <span className={`mt-2 text-xs font-medium text-center ${getLabelColor(index)}`}>
                {stage.label}
              </span>
              {getStepDate(index) && (
                <span className="mt-0.5 text-[10px] text-muted-foreground">
                  {getStepDate(index)}
                </span>
              )}
            </div>

            {/* Connecting line */}
            {index < stages.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mt-[-1.25rem] ${getLineColor(index)} rounded-full`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

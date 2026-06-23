import { CircleCheck, CircleX, CirclePause, CalendarPlus } from 'lucide-react';

interface ProcessTimelineProps {
  currentStage: 'intro_interview' | 'technical_interview' | 'contract_signing';
  status: 'active' | 'hired' | 'not_selected' | 'on_hold';
  introDate?: string | null;
  technicalDate?: string | null;
  contractStatus?: 'pending' | 'under_review' | 'signed' | null;
  onStageClick?: (stageKey: string) => void;
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

function formatTime(date: string | null | undefined): string | null {
  if (!date) return null;
  try {
    const d = new Date(date);
    const startH = d.getHours().toString().padStart(2, '0');
    const startM = d.getMinutes().toString().padStart(2, '0');
    const end = new Date(d.getTime() + 60 * 60 * 1000);
    const endH = end.getHours().toString().padStart(2, '0');
    const endM = end.getMinutes().toString().padStart(2, '0');
    return `${startH}:${startM} - ${endH}:${endM}`;
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
  onStageClick,
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

  function getStepTime(index: number): string | null {
    if (index === 0) return formatTime(introDate);
    if (index === 1) return formatTime(technicalDate);
    return null;
  }

  function getStepState(index: number): 'completed' | 'current' | 'future' {
    if (status === 'hired') return 'completed';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'future';
  }

  function isClickable(index: number): boolean {
    if (!onStageClick) return false;
    if (status !== 'active') return false;
    if (getStepState(index) !== 'future') return false;
    return true;
  }

  function renderIcon(index: number) {
    const stepState = getStepState(index);
    const clickable = isClickable(index);
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

    if (clickable) {
      return (
        <div className="w-8 h-8 rounded-full border-2 border-dashed border-[hsl(210,100%,45%)] bg-[hsl(210,100%,45%)]/5 flex items-center justify-center cursor-pointer hover:bg-[hsl(210,100%,45%)]/15 transition-colors group">
          <CalendarPlus className="w-4 h-4 text-[hsl(210,100%,45%)] group-hover:scale-110 transition-transform" />
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
    if (isClickable(index)) return 'text-[hsl(210,100%,45%)] cursor-pointer hover:underline';
    return 'text-gray-400';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage.key} className="flex items-center flex-1 last:flex-none">
            <div
              className="flex flex-col items-center"
              onClick={() => isClickable(index) && onStageClick?.(stage.key)}
              role={isClickable(index) ? 'button' : undefined}
              tabIndex={isClickable(index) ? 0 : undefined}
              onKeyDown={(e) => e.key === 'Enter' && isClickable(index) && onStageClick?.(stage.key)}
            >
              {renderIcon(index)}
              <span className={`mt-2 text-xs font-medium text-center ${getLabelColor(index)}`}>
                {stage.label}
              </span>
              {getStepDate(index) && (
                <>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                    {getStepDate(index)}
                  </span>
                  {getStepTime(index) && (
                    <span className="text-[10px] text-muted-foreground">
                      {getStepTime(index)}
                    </span>
                  )}
                </>
              )}
            </div>

            {index < stages.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mt-[-1.25rem] ${getLineColor(index)} rounded-full`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { Calendar, Video } from 'lucide-react';

const days = [
  { label: 'Mon', date: '12' },
  { label: 'Tue', date: '13' },
  { label: 'Wed', date: '14' },
  { label: 'Thu', date: '15' },
  { label: 'Fri', date: '16' },
];

const slots = ['09:00', '10:30', '13:00', '14:30'];

/**
 * Static illustration of the interview scheduling step. Purely decorative --
 * no state, no data. Built in markup rather than an image so it stays sharp
 * and theme-aware without adding an asset.
 */
export function SchedulingPreview() {
  return (
    <div
      aria-hidden="true"
      className="bg-white rounded-2xl border border-border shadow-sm p-6 max-w-sm w-full"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calendar className="w-[18px] h-[18px] text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Intro Interview</p>
          <p className="text-xs text-muted-foreground">30 min</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5 mt-5">
        {days.map((day, i) => (
          <div
            key={day.label}
            className={`text-center py-2 rounded-lg border ${
              i === 2
                ? 'bg-primary border-primary text-white'
                : 'border-border text-muted-foreground'
            }`}
          >
            <p className="text-[10px] font-medium uppercase tracking-wide">{day.label}</p>
            <p className="text-sm font-semibold mt-0.5">{day.date}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 mt-4">
        {slots.map((slot, i) => (
          <div
            key={slot}
            className={`h-10 rounded-lg border flex items-center justify-center text-sm font-semibold ${
              i === 1
                ? 'bg-primary border-primary text-white'
                : 'border-border text-foreground'
            }`}
          >
            {slot}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
        <Video className="w-4 h-4 text-primary" />
        Zoom link generated automatically
      </div>
    </div>
  );
}

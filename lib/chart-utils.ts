export function bucketLast14Days<T>(items: T[], getDate: (item: T) => string): { label: string; value: number }[] {
  const days = 14;
  const buckets = new Map<string, number>();
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  items.forEach((item) => {
    const key = getDate(item).slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  });

  return Array.from(buckets.entries()).map(([key, value]) => ({
    label: new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value,
  }));
}

export function countByStatus<T>(items: T[], getStatus: (item: T) => string, labels: Record<string, string>): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const status = getStatus(item);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({ name: labels[status] ?? status, value }));
}

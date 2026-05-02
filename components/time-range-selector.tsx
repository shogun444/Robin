import { TimeRange } from "@/hooks/use-chart-data";

type TimeRangeSelectorProps = {
  activeRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
};

const ranges: TimeRange[] = ["1D", "1W", "1M", "1Y", "5Y"];

export function TimeRangeSelector({ activeRange, onRangeChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1">
      {ranges.map((range) => {
        const isActive = activeRange === range;

        return (
          <button
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? "bg-orange-500 text-white"
                : "bg-surface text-muted hover:bg-surface-strong hover:text-foreground"
            }`}
            key={range}
            onClick={() => onRangeChange(range)}
            type="button"
          >
            {range}
          </button>
        );
      })}
    </div>
  );
}

"use client";

type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  activeId: string;
  onChange: (tabId: string) => void;
  tabs: Tab[];
};

export function Tabs({ activeId, onChange, tabs }: TabsProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;

        return (
          <button
            key={tab.id}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-accent text-background"
                : "text-muted hover:bg-surface-strong hover:text-foreground"
            }`}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

"use client";

type Props = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  tone?: "default" | "error" | "hint";
  className?: string;
};

export default function EmptyState({
  title,
  description,
  action,
  tone = "default",
  className = ""
}: Props) {
  const toneCls =
    tone === "error" ? "text-red-700" :
    tone === "hint" ? "text-gray-600" : "text-gray-700";

  return (
    <div className={`rounded-xl border p-6 text-center ${className}`}>
      <div className={`text-sm font-semibold ${toneCls}`}>{title}</div>
      {description && <div className="mt-2 text-xs text-gray-500">{description}</div>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 inline-flex items-center rounded border px-3 py-1 text-sm hover:bg-gray-50"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

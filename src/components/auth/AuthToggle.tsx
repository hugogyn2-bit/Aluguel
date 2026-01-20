"use client";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
};

export default function AuthToggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
    >
      <span
        className={`relative h-5 w-9 rounded-full border border-white/10 transition ${
          checked ? "bg-cyan-500/60" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition ${
            checked ? "left-4" : "left-1"
          }`}
        />
      </span>
      {label ? <span>{label}</span> : null}
    </button>
  );
}

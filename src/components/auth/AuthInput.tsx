"use client";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function AuthInput({ label, ...props }: Props) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-white/70">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/35 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
      />
    </label>
  );
}

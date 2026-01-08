"use client";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-gray-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

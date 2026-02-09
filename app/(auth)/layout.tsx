export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-gray-800 bg-slate-50 flex items-center justify-center">
      {children}
    </div>
  );
}

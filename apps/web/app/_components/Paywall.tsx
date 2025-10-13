// app/_components/Paywall.tsx
export function Paywall({ 
  isPro, 
  children 
}: { 
  isPro: boolean; 
  children: React.ReactNode 
}) {
  if (!isPro) {
    return (
      <div className="p-4 border rounded bg-gray-50 dark:bg-gray-900">
        <h3 className="font-semibold mb-2">Diamond Pro Required</h3>
        <p className="text-sm opacity-70 mb-3">
          Unlock live pitch-by-pitch tracking, WPA charts, and advanced stats 
          with Diamond Pro.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Upgrade to Pro
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Account page
export const metadata = { title: 'Account — Diamond Insights' };
export default function AccountPage() {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <nav className="grid gap-2">
        <a href="/account/favorites" className="p-3 border rounded">Favorite Teams</a>
        <a href="/account/notifications" className="p-3 border rounded">Notifications</a>
        <a href="/account/subscription" className="p-3 border rounded">Subscription</a>
      </nav>
    </main>
  );
}

export const metadata = {
  title: 'News — Diamond Insights',
  description: 'Auto-generated game previews and recaps for Division I college baseball.'
};

export default function NewsPage() {
  return (
    <main className="p-4 max-w-[720px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">News</h1>
      <p className="opacity-70 mb-4">Auto-generated previews and recaps</p>
      
      <div className="space-y-2">
        <div className="p-4 border rounded">
          <p className="text-sm opacity-70">News articles will appear here</p>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  metadataBase: new URL('https://blazesportsintel.com'),
  title: 'Blaze Intelligence — The Deep South’s Sports Intelligence Hub',
  alternates: { canonical: '/' },
  openGraph: { url: '/', siteName: 'Blaze Intelligence' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: 'Opsdeck',
  description: 'Opsdeck Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

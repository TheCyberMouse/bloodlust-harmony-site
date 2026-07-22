export const metadata = {
  title: "Bloodlust & Harmony MCP",
  description: "Internal MCP server. Move along.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fff" }}>{children}</body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "Mīqāt",
  description: "Your Muslim companion.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0F4D3A",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
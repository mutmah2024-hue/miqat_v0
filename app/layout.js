import "./globals.css";

export const metadata = {
  title: "Mīqāt",
  description: "Your Muslim companion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
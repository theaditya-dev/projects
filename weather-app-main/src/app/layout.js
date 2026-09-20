import "./globals.css";

export const metadata = {
  title: "Weather App",
  description: "A Modern Weather Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

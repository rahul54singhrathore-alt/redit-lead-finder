import "./globals.css";

export const metadata = {
  title: "Lead Finder | Reddit Lead Monitoring",
  description:
    "Track buyer-intent Reddit posts and join the waitlist for early access.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

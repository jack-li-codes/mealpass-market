import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MealPass Market",
  description: "A mock ICS4U marketplace demo for unused meal plan balance."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

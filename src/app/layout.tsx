import type { Metadata } from "next";
import { noto } from "@/lib/fonts";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Takes Map",
  description: "A library of memories about movies and books",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={noto.className}>
      <body>
        <AuthProvider>
          {children}
          <div id="expanded-card-root" />
        </AuthProvider>
      </body>
    </html>
  );
}

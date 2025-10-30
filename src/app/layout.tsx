import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Sidebar from '@/components/karaoke/Sidebar';

export const metadata: Metadata = {
  title: 'DIMZ KARAOKE STUDIO',
  description: 'A modern karaoke experience',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          <Script src="https://www.youtube.com/iframe_api" strategy="beforeInteractive"></Script>
          <Sidebar />
          <main className="md:ml-64 p-4 sm:p-6">
            {children}
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

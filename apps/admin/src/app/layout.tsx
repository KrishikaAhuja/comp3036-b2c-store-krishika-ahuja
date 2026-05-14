import "@repo/ui/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Full stack Blog Admin",
  description: "Administration of Full Stack Blog",
};

export default function RootLayout({
  children, //children represents whatever page is currently being rendered inside the layout.
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> 
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children} 
        
      </body>
    </html>
  );//renders the current page inside the layout. In this case, it renders page.tsx inside the layout, for {children}
}

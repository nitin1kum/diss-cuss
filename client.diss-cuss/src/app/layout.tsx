import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "semantic-ui-css/semantic.min.css";
import Navbar from "@/components/global/navbar";
import {ToastContainer} from 'react-toastify'
import Footer from "@/components/global/footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import AuthProvider from "@/contexts/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Diss-Cuss",
  description:
    "Discuss about any movie, webseries, serial, drama etc with the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg`}
      >
        <ToastContainer
          position="bottom-center"
          hideProgressBar
          limit={3}
        />
        <AuthProvider>
          <ThemeProvider
            attribute={"class"}
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <div className="pt-16 min-h-screen">{children}</div>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

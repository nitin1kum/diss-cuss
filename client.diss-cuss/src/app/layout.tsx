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

export const metadata:Metadata = {
  title: "Diss-Cuss | Movie Discussions & Threads",
  description: "Join Diss-Cuss to explore, discuss, and create threads about your favorite movies. Stay updated and connect with fellow film lovers.",
  keywords: ["movies", "movie discussions", "movie threads", "film community", "Diss-Cuss"],
  openGraph: {
    title: "Diss-Cuss | Talk About Movies",
    description: "Create threads, discuss movies, and join a community of film lovers.",
    url: "${process.env.NEXTBASE_URL}",
    siteName: "Diss-Cuss",
    images: [
      {
        url: `${process.env.NEXTBASE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Diss-Cuss - Talk About Movies",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diss-Cuss | Talk About Movies",
    description: "Join the conversation on your favorite movies. Create threads and connect with others.",
    images: [`${process.env.NEXTBASE_URL}/logo.png`],
  },
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

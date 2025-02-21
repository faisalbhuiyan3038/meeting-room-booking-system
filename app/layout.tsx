import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import Navbar from './components/Layout/Navbar';
import './globals.css';

export const metadata = {
  title: 'Room Booking System',
  description: 'A modern room booking system for managing meeting spaces',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en">
          <body>
            <Navbar />
            <main className="">
              {children}
            </main>
            <Toaster />
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}

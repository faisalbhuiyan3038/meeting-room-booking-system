import { ClerkLoaded, ClerkLoading, ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import Providers from './providers';
import { PageLoadingSpinner } from './components/loading-spinner';
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
              <ClerkLoading>
                <PageLoadingSpinner />
              </ClerkLoading>
              <ClerkLoaded>{children}</ClerkLoaded>
            </main>
            <Toaster />
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}

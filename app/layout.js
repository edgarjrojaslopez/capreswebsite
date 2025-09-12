import '@/styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { Inter } from 'next/font/google';
import { UserProvider } from '@/context/UserContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Capres',
  description: 'Caja de Ahorro',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <UserProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}

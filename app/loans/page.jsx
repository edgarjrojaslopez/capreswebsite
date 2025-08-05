// app/loans/page.jsx
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoansPage from '@/components/LoansPage';

export default function LoansPageRoute() {
  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <LoansPage />
      </main>
    </>
  );
}

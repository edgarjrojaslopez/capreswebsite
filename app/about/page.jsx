// app/about/page.jsx
'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AboutPage from '@/components/AboutPage'; // Asegúrate de que sea export default

export default function AboutPageRoute() {
  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <AboutPage />
      </main>
    </>
  );
}

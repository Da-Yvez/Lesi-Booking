"use client";

import CategoryGrid from "@/components/booking/CategoryGrid";
import Navbar from "@/components/Navbar";

export default function BookPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <CategoryGrid />
      </main>
    </>
  );
}

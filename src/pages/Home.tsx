import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { ScrollTransition } from '../components/home/ScrollTransition';
import { PhilosophySection } from '../components/home/PhilosophySection';
import { DiscoverCategories } from '../components/home/DiscoverCategories';
import { FeaturedFavorites } from '../components/home/FeaturedFavorites';
import { ProductStorySection } from '../components/home/ProductStorySection';
import { WhyNexoraSection } from '../components/home/WhyNexoraSection';
import { Marquee } from '../components/layout/Marquee';
import { BrandStorySection } from '../components/home/BrandStorySection';
import { SocialProofSection } from '../components/home/SocialProofSection';
import { NewsletterSection } from '../components/home/NewsletterSection';

export const Home: React.FC = () => {
  return (
    <main className="editorial-noise">
      {/* SECTION 01 — PREMIUM HERO */}
      <HeroSection />

      {/* SECTION 02 — SCROLL EXPERIENCE */}
      <ScrollTransition />

      {/* SECTION 03 — BRAND PHILOSOPHY */}
      <PhilosophySection />

      {/* SECTION 04 — SHOP BY EXPERIENCE */}
      <DiscoverCategories />

      {/* SECTION 05 — FEATURED PRODUCTS */}
      <FeaturedFavorites />

      {/* SECTION 06 — FEATURED PRODUCT STORY */}
      <ProductStorySection />

      {/* SECTION 07 — WHY NEXORA? */}
      <WhyNexoraSection />

      {/* SECTION 08 — DISCOVERY / MARQUEE */}
      <Marquee theme="light" />

      {/* SECTION 09 — BRAND STORY SECTION */}
      <BrandStorySection />

      {/* SECTION 10 — SOCIAL PROOF */}
      <SocialProofSection />

      {/* SECTION 11 — NEWSLETTER */}
      <NewsletterSection />
    </main>
  );
};

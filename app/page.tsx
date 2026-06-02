import Hero from '@/components/Hero'
import Features from '@/components/Features'
import MzuzuSection from '@/components/MzuzuSection'
import DeliveryProcess from '@/components/DeliveryProcess'
import Stats from '@/components/Stats'
import CTA from '@/components/CTA'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <MzuzuSection />
      <DeliveryProcess />
      <Stats />
      <CTA />
    </div>
  )
}

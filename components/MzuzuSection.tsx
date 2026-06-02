import Image from 'next/image'
import Link from 'next/link'

export default function MzuzuSection() {
  return (
    <section className="py-20 bg-gray-50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-3">Born in Mzuzu</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-5 leading-tight">
              Proudly Serving the{' '}
              <span className="text-teal-700">North Siders</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              DOBADoba was built in the heart of Mzuzu with a mission to empower local businesses and
              provide fast, reliable delivery to everyone in the Northern Region. From the Clock Tower
              to the furthest reaches of the city, we are your local shopping companion.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-xl font-bold text-teal-700">Mzuzu</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">Our Home Base</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100">
                <p className="text-xl font-bold text-teal-700">North</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">Region Specialists</p>
              </div>
            </div>

            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Explore Local Shops
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <Image
                src="/images/mzuzu-tower.png"
                alt="Mzuzu Clock Tower"
                width={800}
                height={1000}
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Iconic Landmark</p>
                <p className="text-sm font-semibold text-gray-900">The Mzuzu Clock Tower</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

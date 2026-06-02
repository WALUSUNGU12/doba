import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-teal-400 hover:text-teal-300 transition-colors mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">About DOBADoba</h1>
          <p className="text-gray-400 text-lg">Empowering Local Commerce in Mzuzu</p>
        </div>

        <div className="space-y-12">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-teal-400 mb-6">Our Story</h2>
            <p className="text-gray-300 leading-relaxed text-lg mb-6">
              DOBADoba was born from a simple vision: to transform how Mzuzu buys, sells, and delivers. 
              We recognized the need for a unified platform that combines the power of a local marketplace 
              with reliable courier services, creating a seamless experience for both buyers and sellers.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              Today, we're proud to be Mzuzu's premier <span className="text-teal-400 font-semibold">marketplace</span> and 
              <span className="text-teal-400 font-semibold">courier</span> solution, connecting communities and empowering 
              local businesses to thrive in the digital age.
            </p>
          </section>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-gray-900 rounded-2xl p-8">
              <div className="w-12 h-12 bg-teal-700/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed">
                To revolutionize local commerce in Malawi by providing a trusted, efficient, and accessible 
                platform that connects buyers with sellers through reliable delivery services. We're committed 
                to empowering local businesses, creating economic opportunities, and making quality products 
                and services accessible to everyone in Mzuzu.
              </p>
            </section>

            <section className="bg-gray-900 rounded-2xl p-8">
              <div className="w-12 h-12 bg-teal-700/20 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
              <p className="text-gray-300 leading-relaxed">
                To become the leading e-commerce and logistics platform in Malawi, setting the standard for 
                innovation, reliability, and customer satisfaction. We envision a future where every local 
                business can reach customers across the city effortlessly, and where every resident can access 
                products and services with confidence and convenience.
              </p>
            </section>
          </div>

          {/* What We Offer */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Local Marketplace</h3>
                    <p className="text-gray-400">
                      A vibrant platform connecting buyers with trusted local sellers. Discover quality products 
                      from your community and support local businesses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">GPS-Tracked Delivery</h3>
                    <p className="text-gray-400">
                      Reliable courier services with real-time GPS tracking. Know exactly where your package is 
                      and when it will arrive.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Seller Platform</h3>
                    <p className="text-gray-400">
                      Powerful tools for sellers to manage inventory, process orders, and grow their business 
                      with ease.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-teal-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Secure Transactions</h3>
                    <p className="text-gray-400">
                      Safe and secure payment processing with buyer and seller protection. Shop and sell with 
                      confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="bg-gradient-to-br from-teal-900/20 to-gray-900 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Choose DOBADoba?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Fast Delivery</h3>
                <p className="text-gray-400 text-sm">Quick and reliable courier services across Mzuzu</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-teal-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Trusted Sellers</h3>
                <p className="text-gray-400 text-sm">Verified sellers with quality products</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-teal-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Fair Pricing</h3>
                <p className="text-gray-400 text-sm">Competitive prices with transparent fees</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-teal-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
                <p className="text-gray-400 text-sm">Always here to help you succeed</p>
              </div>
            </div>
          </section>

          {/* Our Team */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Team</h2>
            <p className="text-gray-300 text-center max-w-3xl mx-auto mb-8">
              We're a passionate team of Malawian entrepreneurs, developers, and logistics experts 
              dedicated to transforming local commerce. Our diverse backgrounds and shared commitment 
              to Mzuzu's growth drive everything we do.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Technology Team', role: 'Building innovative solutions', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { name: 'Operations Team', role: 'Ensuring smooth deliveries', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { name: 'Customer Success', role: 'Supporting our community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
              ].map((member) => (
                <div key={member.name} className="bg-gray-900 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-teal-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={member.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                  <p className="text-gray-400 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Join Our Journey</h2>
            <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
              Whether you're a buyer looking for great deals or a seller ready to reach more customers, 
              DOBADoba is here to help you succeed. Let's build Mzuzu's future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/marketplace" 
                className="px-8 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Explore Marketplace
              </Link>
              <Link 
                href="/auth/register" 
                className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Become a Seller
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

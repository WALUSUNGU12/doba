import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Last updated: May 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using DOBADoba, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our platform. DOBADoba reserves 
              the right to modify these terms at any time, and your continued use of the platform 
              constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">2. Description of Services</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              DOBADoba provides a comprehensive marketplace and courier service platform in Mzuzu, Malawi, 
              consisting of:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-white">Marketplace Services:</strong> A platform connecting buyers with trusted sellers for local commerce</li>
              <li><strong className="text-white">Courier Services:</strong> GPS-tracked delivery services for secure and reliable package delivery</li>
              <li><strong className="text-white">Seller Platform:</strong> Tools for sellers to manage their products, orders, and business operations</li>
              <li><strong className="text-white">Delivery Tracking:</strong> Real-time tracking of deliveries for transparency and peace of mind</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">3. User Accounts</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To access certain features of DOBADoba, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be at least 18 years old or have parental/guardian consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">4. Seller Responsibilities</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Sellers on DOBADoba must adhere to the following responsibilities:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>List only genuine, legal products and services</li>
              <li>Provide accurate descriptions, images, and pricing</li>
              <li>Fulfill orders in a timely manner</li>
              <li>Maintain professional communication with buyers</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not engage in fraudulent or deceptive practices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">5. Buyer Responsibilities</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Buyers using DOBADoba agree to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Provide accurate delivery information</li>
              <li>Pay for orders promptly and in good faith</li>
              <li>Communicate respectfully with sellers</li>
              <li>Inspect deliveries upon receipt</li>
              <li>Report any issues with orders or deliveries promptly</li>
              <li>Not abuse the return or refund policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">6. Delivery Services</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our courier services include:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>GPS-tracked delivery for transparency and security</li>
              <li>Estimated delivery times based on location and service type</li>
              <li>Secure handling of packages during transit</li>
              <li>Proof of delivery confirmation</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              DOBADoba is not liable for delays caused by circumstances beyond our control, including 
              weather conditions, traffic, or other force majeure events.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">7. Payments and Fees</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Payment terms include:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Platform fees may apply to transactions</li>
              <li>Delivery fees are calculated based on distance and service type</li>
              <li>Seller commission fees apply to marketplace sales</li>
              <li>All payments are processed through secure payment gateways</li>
              <li>Refunds are processed according to our refund policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">8. Prohibited Activities</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Users may not:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Sell illegal, counterfeit, or prohibited items</li>
              <li>Use the platform for fraudulent activities</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Post false or misleading information</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the operation of the platform</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">9. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              All content on DOBADoba, including text, graphics, logos, images, and software, is the 
              property of DOBADoba or its content suppliers and is protected by intellectual property laws. 
              Users may not use, reproduce, or distribute any content without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">10. Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              Your use of DOBADoba is also governed by our Privacy Policy, which describes how we collect, 
              use, and protect your personal information. Please review our Privacy Policy for more details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">11. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              DOBADoba shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages arising from your use of the platform. Our total liability shall not exceed the amount 
              you paid for the specific service in question.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">12. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              DOBADoba reserves the right to suspend or terminate your account at any time, with or without 
              cause, with or without notice. Upon termination, your right to use the platform will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">13. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of Malawi. 
              Any disputes arising under these terms shall be resolved in the courts of Malawi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">14. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-900 rounded-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:info@dobadoba.com" className="text-teal-400 hover:text-teal-300 transition-colors">
                  info@dobadoba.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <a href="tel:+265123456789" className="text-teal-400 hover:text-teal-300 transition-colors">
                  +265 123 456 789
                </a>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div>
                  <p className="text-gray-300">Mzuzu City Centre</p>
                  <p className="text-gray-500 text-sm">Malawi</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

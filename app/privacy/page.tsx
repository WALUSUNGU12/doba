import Link from 'next/link'

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: May 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              DOBADoba ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our marketplace 
              and courier services platform. By using DOBADoba, you agree to the collection and use of information 
              in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">2. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We collect several types of information to provide and improve our services:
            </p>
            
            <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Name, email address, phone number</li>
              <li>Delivery address and location data</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Profile information and account settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">Transaction Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Purchase history and order details</li>
              <li>Delivery tracking information</li>
              <li>Seller and buyer interactions</li>
              <li>Payment and refund history</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">Technical Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>GPS location data for delivery tracking</li>
              <li>Usage data and platform interactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-white">Service Delivery:</strong> To process orders, coordinate deliveries, and provide marketplace services</li>
              <li><strong className="text-white">Account Management:</strong> To create and manage your account, authenticate users, and provide customer support</li>
              <li><strong className="text-white">Communication:</strong> To send order confirmations, delivery updates, and promotional communications (with your consent)</li>
              <li><strong className="text-white">Security:</strong> To detect, prevent, and address technical issues, fraud, and security threats</li>
              <li><strong className="text-white">Improvement:</strong> To analyze usage patterns and improve our platform, services, and user experience</li>
              <li><strong className="text-white">Legal Compliance:</strong> To comply with legal obligations and enforce our terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">4. GPS and Location Data</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              As a courier and delivery service, we collect and use location data:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-white">Delivery Tracking:</strong> Real-time GPS tracking to provide accurate delivery status and estimated arrival times</li>
              <li><strong className="text-white">Route Optimization:</strong> To optimize delivery routes for efficiency and reliability</li>
              <li><strong className="text-white">Service Area:</strong> To determine service availability and delivery zones</li>
              <li><strong className="text-white">Security:</strong> To ensure the safety of couriers and packages during transit</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Location data is only used for delivery purposes and is not shared with third parties for marketing or other unrelated purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">5. Information Sharing</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-white">With Sellers:</strong> Your delivery address and contact information are shared with sellers to fulfill orders</li>
              <li><strong className="text-white">With Couriers:</strong> Delivery location and contact information are shared with couriers for package delivery</li>
              <li><strong className="text-white">Service Providers:</strong> With trusted third-party service providers who assist in operating our platform (payment processors, delivery partners)</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights, property, or safety</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, sale, or transfer of business assets</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We do not sell your personal information to third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">6. Data Security</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Secure socket layer (SSL) encryption for data transmission</li>
              <li>Secure payment processing through PCI-compliant payment gateways</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication systems</li>
              <li>Secure data storage and backup procedures</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              While we strive to protect your information, no method of transmission over the internet is 100% secure. 
              We cannot guarantee absolute security but are committed to implementing reasonable security measures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">7. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Fulfill the purposes for which it was collected</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our agreements</li>
              <li>Maintain business records and analytics</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You may request deletion of your personal information, subject to legal and business requirements. 
              Transaction records may be retained for accounting and legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">8. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong className="text-white">Access:</strong> Request access to your personal information</li>
              <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your personal information</li>
              <li><strong className="text-white">Portability:</strong> Request transfer of your data to another service</li>
              <li><strong className="text-white">Objection:</strong> Object to processing of your information</li>
              <li><strong className="text-white">Restriction:</strong> Request restriction of processing your information</li>
              <li><strong className="text-white">Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze platform usage and improve performance</li>
              <li>Provide personalized content and recommendations</li>
              <li>Authenticate users and maintain sessions</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You can control cookie settings through your browser preferences. However, disabling cookies may affect 
              the functionality of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">10. Third-Party Links</h2>
            <p className="text-gray-300 leading-relaxed">
              Our platform may contain links to third-party websites. We are not responsible for the privacy practices 
              or content of these external sites. We encourage you to review the privacy policies of any third-party 
              sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">11. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for children under 18 years of age. We do not knowingly collect personal 
              information from children. If we become aware that we have collected information from a child, we will take 
              steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
              the new policy on our platform and updating the "Last updated" date. Your continued use of our platform 
              after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-400 mb-4">13. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or your personal information, please contact us:
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

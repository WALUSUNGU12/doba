const steps = [
  {
    id: 1,
    title: 'Browse & Order',
    description: 'Shop from our marketplace of 500+ local sellers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Instant Dispatch',
    description: 'Your order is immediately assigned to a nearby courier',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Real-Time Tracking',
    description: 'Track your delivery with GPS technology in real-time',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Same-Day Delivery',
    description: 'Receive your items within 2 hours, right at your doorstep',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const highlights = [
  {
    title: 'Instant Courier Assignment',
    description: 'No waiting for delivery partners — our couriers are integrated',
  },
  {
    title: 'GPS Real-Time Tracking',
    description: 'Watch your delivery progress in real-time on our map',
  },
  {
    title: 'Same-Day Delivery Guarantee',
    description: 'Get your items within 2 hours or it\'s free',
  },
]

export default function DeliveryProcess() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-xl mb-14">
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Shop and Get Delivered in 4 Simple Steps
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Experience seamless shopping with our integrated marketplace and courier system. From order
            to delivery, we've got you covered.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(100%-0px)] w-full h-px bg-gray-200 z-0" style={{ left: 'calc(50% + 20px)', width: 'calc(100% - 40px)' }} />
              )}
              <div className="relative z-10 flex flex-col items-start">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center flex-shrink-0">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-400">Step {step.id}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="bg-gray-950 rounded-2xl p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">
                Integrated Marketplace &amp; Courier System
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Unlike other platforms, DOBADoba combines shopping and delivery in one seamless
                experience. When you buy from our marketplace, our couriers are already on standby to
                deliver your items immediately.
              </p>
              <div className="space-y-4">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{h.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{h.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery status card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white">Live Delivery Status</p>
                <span className="text-xs bg-teal-700/30 text-teal-300 border border-teal-600/30 px-2 py-0.5 rounded-full">
                  In Transit
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Order placed', time: '2:30 PM', done: true },
                  { label: 'Courier assigned', time: '2:32 PM', done: true },
                  { label: 'Out for delivery', time: '2:35 PM', active: true },
                  { label: 'Estimated arrival', time: '3:30 PM', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        item.active
                          ? 'bg-amber-400 animate-pulse'
                          : item.done
                          ? 'bg-teal-500'
                          : 'bg-white/20'
                      }`}
                    />
                    <p className={`text-sm ${item.done || item.active ? 'text-gray-200' : 'text-gray-500'}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs ml-auto ${item.done || item.active ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

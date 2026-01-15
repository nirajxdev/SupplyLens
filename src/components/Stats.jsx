import React from 'react'

const Stats = () => {
  const stats = [
    { value: '99.9%', label: 'Uptime Guarantee', suffix: '' },
    { value: '50', label: 'Countries Covered', suffix: '+' },
    { value: '2M', label: 'Shipments Tracked', suffix: '+' },
    { value: '35', label: 'Cost Reduction', suffix: '%' },
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Trusted by leading enterprises worldwide
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            Join thousands of companies transforming their supply chain operations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">
                {stat.value}
                <span className="text-blue-200">{stat.suffix}</span>
              </div>
              <p className="mt-2 text-blue-100 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Company Logos Placeholder */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
          {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((company, index) => (
            <div
              key={index}
              className="text-white/60 font-bold text-xl tracking-wider"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats

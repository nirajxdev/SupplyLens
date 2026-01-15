import React from 'react'
import { Upload, Settings, LineChart, CheckCircle } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      step: '01',
      title: 'Connect Your Data',
      description: 'Integrate your existing systems, upload supplier data, or connect via our APIs.',
    },
    {
      icon: Settings,
      step: '02',
      title: 'Configure Workflows',
      description: 'Set up custom alerts, tracking parameters, and reporting preferences.',
    },
    {
      icon: LineChart,
      step: '03',
      title: 'Gain Insights',
      description: 'Access real-time dashboards, analytics, and AI-powered recommendations.',
    },
    {
      icon: CheckCircle,
      step: '04',
      title: 'Optimize & Scale',
      description: 'Continuously improve operations with data-driven decisions and automation.',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Get started in four simple steps
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            From integration to optimization, we make supply chain management simple and effective.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 to-blue-100"></div>
              )}
              
              <div className="relative bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all text-center">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {item.step}
                </div>
                
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mt-4 group-hover:bg-blue-100 transition-colors">
                  <item.icon className="h-8 w-8 text-blue-600" />
                </div>
                
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

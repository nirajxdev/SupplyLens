import React from 'react'
import { 
  BarChart3, 
  Globe, 
  Bell, 
  Truck, 
  ShieldCheck, 
  Cpu,
  ArrowUpRight
} from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Globe,
      title: 'Real-Time Tracking',
      description: 'Monitor your shipments across the globe with GPS precision and instant status updates.',
      color: 'blue',
    },
    {
      icon: BarChart3,
      title: 'Predictive Analytics',
      description: 'AI-powered forecasting to anticipate demand, prevent stockouts, and optimize inventory.',
      color: 'purple',
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Proactive notifications for delays, disruptions, and potential supply chain risks.',
      color: 'yellow',
    },
    {
      icon: Truck,
      title: 'Logistics Optimization',
      description: 'Optimize routes, reduce costs, and improve delivery times with intelligent routing.',
      color: 'green',
    },
    {
      icon: ShieldCheck,
      title: 'Risk Management',
      description: 'Identify and mitigate supply chain vulnerabilities before they impact operations.',
      color: 'red',
    },
    {
      icon: Cpu,
      title: 'API Integration',
      description: 'Seamless integration with ERP, WMS, and existing enterprise systems.',
      color: 'indigo',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600',
    purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600',
    green: 'bg-green-100 text-green-600 group-hover:bg-green-600',
    red: 'bg-red-100 text-red-600 group-hover:bg-red-600',
    indigo: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600',
  }

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Everything you need to manage your supply chain
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Powerful tools designed to give you complete visibility and control 
            over your entire supply chain operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100"
            >
              <div className={`inline-flex p-3 rounded-xl ${colorClasses[feature.color]} group-hover:text-white transition-colors`}>
                <feature.icon className="h-6 w-6" />
              </div>
              
              <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="mt-3 text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              <a
                href="#"
                className="inline-flex items-center mt-4 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Learn more
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features

import React from 'react'
import { ArrowRight, Play, TrendingUp, Shield, Zap } from 'lucide-react'

const Hero = () => {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4 mr-2" />
              Final Year Project 2026
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Intelligent
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Supply Chain </span>
              Visibility
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
              SupplyLens empowers businesses with real-time insights, predictive analytics, 
              and end-to-end visibility across your entire supply chain network.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center justify-center bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all group">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center text-gray-500">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                <span className="text-sm">Enterprise Security</span>
              </div>
              <div className="flex items-center text-gray-500">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-sm">99.9% Uptime</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 transform hover:scale-[1.02] transition-transform">
              {/* Mock Dashboard */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Supply Chain Overview</h3>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Live</span>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">2,847</p>
                    <p className="text-xs text-gray-600">Active Shipments</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-green-600">98.5%</p>
                    <p className="text-xs text-gray-600">On-Time Delivery</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600">156</p>
                    <p className="text-xs text-gray-600">Suppliers</p>
                  </div>
                </div>
                
                {/* Chart Placeholder */}
                <div className="bg-gray-50 rounded-xl p-4 h-40 flex items-end justify-around">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md w-8"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
                
                {/* Recent Activity */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Recent Activity</p>
                  {[
                    { status: 'Delivered', location: 'New York Warehouse', time: '2 min ago' },
                    { status: 'In Transit', location: 'Chicago Hub', time: '15 min ago' },
                    { status: 'Processing', location: 'LA Distribution', time: '1 hr ago' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'Delivered' ? 'bg-green-500' :
                          item.status === 'In Transit' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm text-gray-700">{item.location}</span>
                      </div>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  IndianRupee, TrendingUp, PiggyBank, Package, ShoppingCart, 
  MapPin, PlusCircle, BarChart3, MessageSquare, ExternalLink, 
  Leaf, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

import { 
  DEMO_FARMERS, DEMO_LISTINGS, DEMO_ORDERS, 
  DEMO_FORECASTS, GOVERNMENT_SCHEMES 
} from "@/data/mock-data";

export default function FarmerDashboard() {
  const [mounted, setMounted] = useState(false);
  const farmer = DEMO_FARMERS[0]; // Ramesh Patil

  // Derived mock data for Ramesh
  const activeListings = DEMO_LISTINGS.filter(l => l.farmerId === farmer.id);
  const myOrders = DEMO_ORDERS.filter(o => o.farmerId === farmer.id);
  const myForecasts = DEMO_FORECASTS.filter(f => f.region === farmer.state);
  
  // Forecast chart data
  const chartData = [
    { date: "Day 1", price: 25 },
    { date: "Day 3", price: 27 },
    { date: "Day 5", price: 30 },
    { date: "Day 7", price: 32 }, // Predicted
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const glassClass = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl";

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8 font-sans overflow-x-hidden">
      <motion.div 
        className="max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
              Welcome, {farmer.name.split(' ')[0]} 🌾
            </h1>
            <div className="flex items-center text-neutral-400 mt-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{farmer.farmAddress}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/farmer" className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium">
              <PlusCircle className="w-5 h-5" />
              List New Produce
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions (Mobile optimized) */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/farmer" className={`${glassClass} flex flex-col items-center justify-center p-4 hover:bg-white/10 transition-colors group cursor-pointer`}>
            <PlusCircle className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">List Produce</span>
          </Link>
          <Link href="/analytics" className={`${glassClass} flex flex-col items-center justify-center p-4 hover:bg-white/10 transition-colors group cursor-pointer`}>
            <BarChart3 className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Analytics</span>
          </Link>
          <Link href="/chat" className={`${glassClass} flex flex-col items-center justify-center p-4 hover:bg-white/10 transition-colors group cursor-pointer`}>
            <MessageSquare className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Chat</span>
          </Link>
          <div className={`${glassClass} flex flex-col items-center justify-center p-4 hover:bg-white/10 transition-colors group cursor-pointer`}>
            <ShoppingCart className="w-8 h-8 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">My Orders</span>
          </div>
        </motion.div>

        {/* Earnings Summary Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={glassClass}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-neutral-400 text-sm font-medium">Total Earnings This Month</h3>
            <div className="text-3xl font-bold mt-1">₹45,000</div>
            <div className="text-green-400 text-sm flex items-center mt-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12% vs last month
            </div>
          </div>

          <div className={`${glassClass} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                  THE MONEY SHOT
                </div>
              </div>
              <h3 className="text-neutral-400 text-sm font-medium">vs Mandi Rate</h3>
              <div className="text-3xl font-bold mt-1 text-emerald-400">+₹12,450</div>
              <div className="text-emerald-400 text-sm mt-2 font-medium">
                (+38% higher returns)
              </div>
            </div>
          </div>

          <div className={glassClass}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-neutral-400 text-sm font-medium">Middleman Savings</h3>
            <div className="text-3xl font-bold mt-1">₹18,200</div>
            <div className="text-blue-400 text-sm mt-2">
              Saved by selling directly
            </div>
          </div>

          <div className={glassClass}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-neutral-400 text-sm font-medium">Activity</h3>
            <div className="text-3xl font-bold mt-1">
              {activeListings.length} <span className="text-lg text-neutral-400 font-normal">Listings</span>
            </div>
            <div className="text-xl font-bold mt-1 text-neutral-300">
              {myOrders.length} <span className="text-sm text-neutral-400 font-normal">Orders</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Listings and Orders */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Listings */}
            <motion.div variants={itemVariants} className={glassClass}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <Leaf className="w-5 h-5 mr-2 text-green-400" />
                  My Active Listings
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-neutral-400 border-b border-white/10">
                      <th className="pb-3 font-medium">Produce</th>
                      <th className="pb-3 font-medium">Quantity</th>
                      <th className="pb-3 font-medium">Price/kg</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeListings.map(listing => (
                      <tr key={listing.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="font-medium capitalize">{listing.cropType}</div>
                          <div className="text-xs text-neutral-400">{listing.variety}</div>
                        </td>
                        <td className="py-4">{listing.availableQuantityKg} {listing.unitOfMeasure}</td>
                        <td className="py-4 font-medium text-emerald-400">₹{listing.askingPricePerKg}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border
                            ${listing.status === 'listed' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : ''}
                            ${listing.status === 'negotiating' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : ''}
                            ${listing.status === 'matched' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : ''}
                          `}>
                            {listing.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {activeListings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-neutral-500">No active listings</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* My Orders */}
            <motion.div variants={itemVariants} className={glassClass}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-orange-400" />
                  Recent Orders
                </h2>
              </div>
              <div className="space-y-4">
                {myOrders.map(order => (
                  <div key={order.id} className="bg-white/5 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 border border-white/5">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className={`p-3 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {order.status === 'delivered' ? <CheckCircle className="w-6 h-6" /> :
                         order.status === 'in_transit' ? <MapPin className="w-6 h-6" /> :
                         <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="font-medium text-lg capitalize">{order.cropType} ({order.quantityKg}kg)</div>
                        <div className="text-sm text-neutral-400">Buyer: {order.buyerName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">₹{order.totalAmount}</div>
                        <div className="text-xs text-neutral-400">{order.status.replace('_', ' ').toUpperCase()}</div>
                      </div>
                      <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {myOrders.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">No recent orders</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Widgets */}
          <div className="space-y-8">
            
            {/* Demand Forecast Widget */}
            <motion.div variants={itemVariants} className={glassClass}>
              <h2 className="text-lg font-bold mb-4 flex items-center text-orange-400">
                <TrendingUp className="w-5 h-5 mr-2" />
                Demand Forecast
              </h2>
              {myForecasts.slice(0, 1).map((forecast, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-sm text-orange-200">
                    🔥 <span className="font-semibold capitalize">{forecast.cropType}</span> demand {forecast.trend === 'rising' ? '↑' : '↓'} next week in {forecast.region}.
                    <div className="mt-1 font-medium">{forecast.recommendation}</div>
                  </div>
                  
                  <div className="h-40 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} width={30} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', color: '#fff' }}
                          itemStyle={{ color: '#f97316' }}
                        />
                        <Area type="monotone" dataKey="price" stroke="#f97316" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center text-xs text-neutral-500">Projected price trend (₹/kg)</div>
                </div>
              ))}
            </motion.div>

            {/* Government Schemes */}
            <motion.div variants={itemVariants} className={glassClass}>
              <h2 className="text-lg font-bold mb-4 flex items-center text-blue-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                Govt. Schemes
              </h2>
              <div className="space-y-4">
                {GOVERNMENT_SCHEMES.slice(0, 2).map(scheme => (
                  <div key={scheme.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <h3 className="font-bold text-white flex justify-between items-start">
                      {scheme.name}
                      <span className="text-xs font-medium px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md uppercase">
                        {scheme.category}
                      </span>
                    </h3>
                    <p className="text-sm text-neutral-400 mt-2 line-clamp-2">
                      {scheme.description}
                    </p>
                    <a 
                      href={scheme.applicationUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                      Apply Now <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
}

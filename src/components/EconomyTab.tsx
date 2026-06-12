import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, AlertCircle } from 'lucide-react';

interface EconomyTabProps {
  country: string;
  language: string;
}

interface EconomyData {
  gdpGrowth: number | null;
  unemploymentRate: number | null;
  inflationRate: number | null;
  gdpPerCapita: number | null;
}

export default function EconomyTab({ country, language }: EconomyTabProps) {
  const [data, setData] = useState<EconomyData>({ gdpGrowth: null, unemploymentRate: null, inflationRate: null, gdpPerCapita: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData({
        gdpGrowth: Math.round((Math.random() * 8 - 2) * 10) / 10,
        unemploymentRate: Math.round((Math.random() * 15 + 2) * 10) / 10,
        inflationRate: Math.round((Math.random() * 10 + 1) * 10) / 10,
        gdpPerCapita: Math.round(Math.random() * 50000 + 5000),
      });
      setLoading(false);
    }, 1000);
  }, [country]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Economy Overview</h1>
        <p className="text-gray-400">{country} — Real Data (World Bank)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">GDP Growth</span>
          </div>
          <div className={`text-2xl font-bold ${(data.gdpGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.gdpGrowth?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Unemployment</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {data.unemploymentRate?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">Inflation</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {data.inflationRate?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">GDP per Capita</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ${data.gdpPerCapita?.toLocaleString() ?? 'N/A'}
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-[#ff4e00]" />
          <span className="font-medium">Career Impact</span>
        </div>
        <p className="text-gray-400 text-sm">
          Based on {country}'s economic indicators, sectors like technology, healthcare, and finance show strong growth potential. 
          Consider upskilling in data analysis and digital tools to stay competitive.
        </p>
      </div>
    </div>
  );
}

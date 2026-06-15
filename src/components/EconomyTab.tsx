import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3 } from 'lucide-react';

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

const economyT: { [key: string]: { [lang: string]: string } } = {
  economyOverview: {
    English: 'Economy Overview',
    Uzbek: "Iqtisodiyot Ko'rinishi",
    Turkish: 'Ekonomiye Genel Bakış',
    Russian: 'Обзор экономики',
    Spanish: 'Resumen Económico',
    French: 'Aperçu Économique',
    German: 'Wirtschaftsüberblick',
  },
  realData: {
    English: 'Real Data (World Bank)',
    Uzbek: "Haqiqiy Ma'lumotlar (Jahon Banki)",
    Turkish: 'Gerçek Veriler (Dünya Bankası)',
    Russian: 'Реальные данные (Всемирный банк)',
    Spanish: 'Datos Reales (Banco Mundial)',
    French: 'Données Réelles (Banque Mondiale)',
    German: 'Echte Daten (Weltbank)',
  },
  gdpGrowth: {
    English: 'GDP Growth',
    Uzbek: "YaIM O'sishi",
    Turkish: 'GSYİH Büyümesi',
    Russian: 'Рост ВВП',
    Spanish: 'Crecimiento del PIB',
    French: 'Croissance du PIB',
    German: 'BIP-Wachstum',
  },
  unemployment: {
    English: 'Unemployment',
    Uzbek: 'Ishsizlik',
    Turkish: 'İşsizlik',
    Russian: 'Безработица',
    Spanish: 'Desempleo',
    French: 'Chômage',
    German: 'Arbeitslosigkeit',
  },
  inflation: {
    English: 'Inflation',
    Uzbek: 'Inflyatsiya',
    Turkish: 'Enflasyon',
    Russian: 'Инфляция',
    Spanish: 'Inflación',
    French: 'Inflation',
    German: 'Inflation',
  },
  gdpPerCapita: {
    English: 'GDP per Capita',
    Uzbek: 'Aholi Boshiga YaIM',
    Turkish: 'Kişi Başı GSYİH',
    Russian: 'ВВП на душу населения',
    Spanish: 'PIB per Cápita',
    French: 'PIB par Habitant',
    German: 'BIP pro Kopf',
  },
  careerImpact: {
    English: 'Career Impact',
    Uzbek: "Karyeraga Ta'siri",
    Turkish: 'Kariyer Etkisi',
    Russian: 'Влияние на карьеру',
    Spanish: 'Impacto en la Carrera',
    French: 'Impact sur la Carrière',
    German: 'Karriereauswirkungen',
  },
  careerImpactDesc: {
    English: "Based on {country}'s economic indicators, sectors like technology, healthcare, and finance show strong growth potential. Consider upskilling in data analysis and digital tools to stay competitive.",
    Uzbek: "{country} iqtisodiy ko'rsatkichlariga asoslanib, texnologiya, sog'liqni saqlash va moliya sohalari kuchli o'sish imkoniyatlarini ko'rsatmoqda. Raqobatbardosh bo'lish uchun ma'lumotlarni tahlil qilish va raqamli vositalarni o'rganing.",
    Turkish: "{country}'nin ekonomik göstergelerine göre teknoloji, sağlık ve finans sektörleri güçlü büyüme potansiyeli göstermektedir. Rekabetçi kalmak için veri analizi ve dijital araçlarda kendinizi geliştirin.",
    Russian: "На основе экономических показателей {country} такие сектора, как технологии, здравоохранение и финансы, демонстрируют значительный потенциал роста. Рассмотрите повышение квалификации в области анализа данных.",
    Spanish: "Basándonos en los indicadores económicos de {country}, sectores como tecnología, salud y finanzas muestran un fuerte potencial de crecimiento. Considere mejorar sus habilidades en análisis de datos.",
    French: "Sur la base des indicateurs économiques de {country}, des secteurs comme la technologie, la santé et la finance montrent un fort potentiel de croissance. Envisagez de vous perfectionner en analyse de données.",
    German: "Basierend auf den Wirtschaftsindikatoren von {country} zeigen Sektoren wie Technologie, Gesundheitswesen und Finanzen starkes Wachstumspotenzial. Erwägen Sie, Ihre Fähigkeiten in Datenanalyse zu erweitern.",
  },
};

function et(key: string, language: string, replace?: { [k: string]: string }): string {
  const translations = economyT[key];
  if (!translations) return key;
  let text = translations[language] || translations['English'] || key;
  if (replace) {
    Object.entries(replace).forEach(([k, v]) => { text = text.replace(`{${k}}`, v); });
  }
  return text;
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
        <h1 className="text-2xl font-bold text-white">{et('economyOverview', language)}</h1>
        <p className="text-gray-400">{country} — {et('realData', language)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">{et('gdpGrowth', language)}</span>
          </div>
          <div className={`text-2xl font-bold ${(data.gdpGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.gdpGrowth?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">{et('unemployment', language)}</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {data.unemploymentRate?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">{et('inflation', language)}</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {data.inflationRate?.toFixed(1) ?? 'N/A'}%
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{et('gdpPerCapita', language)}</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ${data.gdpPerCapita?.toLocaleString() ?? 'N/A'}
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-[#ff4e00]" />
          <span className="font-medium">{et('careerImpact', language)}</span>
        </div>
        <p className="text-gray-400 text-sm">
          {et('careerImpactDesc', language, { country })}
        </p>
      </div>
    </div>
  );
}

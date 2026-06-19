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
    Chinese: '经济概览',
    Japanese: '経済概要',
    Korean: '경제 개요',
    Arabic: 'نظرة عامة على الاقتصاد',
    Hindi: 'अर्थव्यवस्था अवलोकन',
    Portuguese: 'Visão Geral da Economia',
    Italian: 'Panoramica Economica',
    Dutch: 'Economisch Overzicht',
    Polish: 'Przegląd Gospodarczy',
    Swedish: 'Ekonomisk Översikt',
    Norwegian: 'Økonomisk Oversikt',
    Danish: 'Økonomisk Oversigt',
    Finnish: 'Talouden Yleiskatsaus',
    Ukrainian: 'Огляд економіки',
    Romanian: 'Prezentare Economică',
    Hungarian: 'Gazdasági Áttekintés',
    Czech: 'Ekonomický Přehled',
    Greek: 'Οικονομική Επισκόπηση',
    Hebrew: 'סקירה כלכלית',
    Indonesian: 'Tinjauan Ekonomi',
    Malay: 'Gambaran Keseluruhan Ekonomi',
    Thai: 'ภาพรวมเศรษฐกิจ',
    Vietnamese: 'Tổng Quan Kinh Tế',
    Persian: 'مرور اقتصادی',
    Swahili: 'Muhtasari wa Uchumi',
    Kazakh: 'Экономикаға шолу',
  },
  realData: {
    English: 'Real Data (World Bank)',
    Uzbek: "Haqiqiy Ma'lumotlar (Jahon Banki)",
    Turkish: 'Gerçek Veriler (Dünya Bankası)',
    Russian: 'Реальные данные (Всемирный банк)',
    Spanish: 'Datos Reales (Banco Mundial)',
    French: 'Données Réelles (Banque Mondiale)',
    German: 'Echte Daten (Weltbank)',
    Chinese: '真实数据（世界银行）',
    Japanese: '実際のデータ（世界銀行）',
    Korean: '실제 데이터 (세계은행)',
    Arabic: 'بيانات حقيقية (البنك الدولي)',
    Hindi: 'वास्तविक डेटा (विश्व बैंक)',
    Portuguese: 'Dados Reais (Banco Mundial)',
    Italian: 'Dati Reali (Banca Mondiale)',
    Dutch: 'Echte Gegevens (Wereldbank)',
    Polish: 'Prawdziwe Dane (Bank Światowy)',
    Swedish: 'Verkliga Data (Världsbanken)',
    Norwegian: 'Ekte Data (Verdensbanken)',
    Danish: 'Virkelige Data (Verdensbanken)',
    Finnish: 'Todellinen Data (Maailmanpankki)',
    Ukrainian: 'Реальні дані (Світовий банк)',
    Romanian: 'Date Reale (Banca Mondială)',
    Hungarian: 'Valós Adatok (Világbank)',
    Czech: 'Skutečná Data (Světová banka)',
    Greek: 'Πραγματικά Δεδομένα (Παγκόσμια Τράπεζα)',
    Hebrew: 'נתונים אמיתיים (הבנק העולמי)',
    Indonesian: 'Data Nyata (Bank Dunia)',
    Malay: 'Data Sebenar (Bank Dunia)',
    Thai: 'ข้อมูลจริง (ธนาคารโลก)',
    Vietnamese: 'Dữ Liệu Thực (Ngân hàng Thế giới)',
    Persian: 'داده‌های واقعی (بانک جهانی)',
    Swahili: 'Data Halisi (Benki ya Dunia)',
    Kazakh: 'Нақты деректер (Дүниежүзілік банк)',
  },
  gdpGrowth: {
    English: 'GDP Growth',
    Uzbek: "YaIM O'sishi",
    Turkish: 'GSYİH Büyümesi',
    Russian: 'Рост ВВП',
    Spanish: 'Crecimiento del PIB',
    French: 'Croissance du PIB',
    German: 'BIP-Wachstum',
    Chinese: 'GDP增长',
    Japanese: 'GDP成長率',
    Korean: 'GDP 성장률',
    Arabic: 'نمو الناتج المحلي الإجمالي',
    Hindi: 'जीडीपी वृद्धि',
    Portuguese: 'Crescimento do PIB',
    Italian: 'Crescita del PIL',
    Dutch: 'BBP-groei',
    Polish: 'Wzrost PKB',
    Swedish: 'BNP-tillväxt',
    Norwegian: 'BNP-vekst',
    Danish: 'BNP-vækst',
    Finnish: 'BKT-kasvu',
    Ukrainian: 'Зростання ВВП',
    Romanian: 'Creștere PIB',
    Hungarian: 'GDP Növekedés',
    Czech: 'Růst HDP',
    Greek: 'Ανάπτυξη ΑΕΠ',
    Hebrew: 'צמיחת תמ"ג',
    Indonesian: 'Pertumbuhan PDB',
    Malay: 'Pertumbuhan KDNK',
    Thai: 'การเติบโตของ GDP',
    Vietnamese: 'Tăng Trưởng GDP',
    Persian: 'رشد تولید ناخالص داخلی',
    Swahili: 'Ukuaji wa Pato la Taifa',
    Kazakh: 'ЖІӨ өсімі',
  },
  unemployment: {
    English: 'Unemployment',
    Uzbek: 'Ishsizlik',
    Turkish: 'İşsizlik',
    Russian: 'Безработица',
    Spanish: 'Desempleo',
    French: 'Chômage',
    German: 'Arbeitslosigkeit',
    Chinese: '失业率',
    Japanese: '失業率',
    Korean: '실업률',
    Arabic: 'البطالة',
    Hindi: 'बेरोजगारी',
    Portuguese: 'Desemprego',
    Italian: 'Disoccupazione',
    Dutch: 'Werkloosheid',
    Polish: 'Bezrobocie',
    Swedish: 'Arbetslöshet',
    Norwegian: 'Arbeidsledighet',
    Danish: 'Arbejdsløshed',
    Finnish: 'Työttömyys',
    Ukrainian: 'Безробіття',
    Romanian: 'Șomaj',
    Hungarian: 'Munkanélküliség',
    Czech: 'Nezaměstnanost',
    Greek: 'Ανεργία',
    Hebrew: 'אבטלה',
    Indonesian: 'Pengangguran',
    Malay: 'Pengangguran',
    Thai: 'การว่างงาน',
    Vietnamese: 'Thất Nghiệp',
    Persian: 'بیکاری',
    Swahili: 'Ukosefu wa Ajira',
    Kazakh: 'Жұмыссыздық',
  },
  inflation: {
    English: 'Inflation',
    Uzbek: 'Inflyatsiya',
    Turkish: 'Enflasyon',
    Russian: 'Инфляция',
    Spanish: 'Inflación',
    French: 'Inflation',
    German: 'Inflation',
    Chinese: '通货膨胀',
    Japanese: 'インフレ',
    Korean: '인플레이션',
    Arabic: 'التضخم',
    Hindi: 'मुद्रास्फीति',
    Portuguese: 'Inflação',
    Italian: 'Inflazione',
    Dutch: 'Inflatie',
    Polish: 'Inflacja',
    Swedish: 'Inflation',
    Norwegian: 'Inflasjon',
    Danish: 'Inflation',
    Finnish: 'Inflaatio',
    Ukrainian: 'Інфляція',
    Romanian: 'Inflație',
    Hungarian: 'Infláció',
    Czech: 'Inflace',
    Greek: 'Πληθωρισμός',
    Hebrew: 'אינפלציה',
    Indonesian: 'Inflasi',
    Malay: 'Inflasi',
    Thai: 'อัตราเงินเฟ้อ',
    Vietnamese: 'Lạm Phát',
    Persian: 'تورم',
    Swahili: 'Mfumuko wa Bei',
    Kazakh: 'Инфляция',
  },
  gdpPerCapita: {
    English: 'GDP per Capita',
    Uzbek: 'Aholi Boshiga YaIM',
    Turkish: 'Kişi Başı GSYİH',
    Russian: 'ВВП на душу населения',
    Spanish: 'PIB per Cápita',
    French: 'PIB par Habitant',
    German: 'BIP pro Kopf',
    Chinese: '人均GDP',
    Japanese: '一人当たりGDP',
    Korean: '1인당 GDP',
    Arabic: 'الناتج المحلي الإجمالي للفرد',
    Hindi: 'प्रति व्यक्ति जीडीपी',
    Portuguese: 'PIB per Capita',
    Italian: 'PIL pro Capite',
    Dutch: 'BBP per Hoofd',
    Polish: 'PKB per Capita',
    Swedish: 'BNP per Capita',
    Norwegian: 'BNP per Innbygger',
    Danish: 'BNP per Indbygger',
    Finnish: 'BKT per Asukas',
    Ukrainian: 'ВВП на душу населення',
    Romanian: 'PIB pe Cap de Locuitor',
    Hungarian: 'GDP per Fő',
    Czech: 'HDP na Obyvatele',
    Greek: 'ΑΕΠ ανά Κάτοικο',
    Hebrew: 'תמ"ג לנפש',
    Indonesian: 'PDB per Kapita',
    Malay: 'KDNK per Kapita',
    Thai: 'GDP ต่อหัว',
    Vietnamese: 'GDP Bình Quân Đầu Người',
    Persian: 'تولید ناخالص داخلی سرانه',
    Swahili: 'Pato la Taifa kwa Kila Mtu',
    Kazakh: 'Жан басына шаққандағы ЖІӨ',
  },
  careerImpact: {
    English: 'Career Impact',
    Uzbek: "Karyeraga Ta'siri",
    Turkish: 'Kariyer Etkisi',
    Russian: 'Влияние на карьеру',
    Spanish: 'Impacto en la Carrera',
    French: 'Impact sur la Carrière',
    German: 'Karriereauswirkungen',
    Chinese: '职业影响',
    Japanese: 'キャリアへの影響',
    Korean: '경력 영향',
    Arabic: 'التأثير المهني',
    Hindi: 'करियर प्रभाव',
    Portuguese: 'Impacto na Carreira',
    Italian: 'Impatto sulla Carriera',
    Dutch: 'Carrière Impact',
    Polish: 'Wpływ na Karierę',
    Swedish: 'Karriärpåverkan',
    Norwegian: 'Karrierepåvirkning',
    Danish: 'Karrierepåvirkning',
    Finnish: 'Uravaikutus',
    Ukrainian: 'Вплив на кар\'єру',
    Romanian: 'Impact asupra Carierei',
    Hungarian: 'Karrierhatás',
    Czech: 'Dopad na Kariéru',
    Greek: 'Επίδραση στην Καριέρα',
    Hebrew: 'השפעה על הקריירה',
    Indonesian: 'Dampak Karir',
    Malay: 'Impak Kerjaya',
    Thai: 'ผลกระทบต่ออาชีพ',
    Vietnamese: 'Tác Động Nghề Nghiệp',
    Persian: 'تأثیر شغلی',
    Swahili: 'Athari kwa Kazi',
    Kazakh: 'Мансапқа әсері',
  },
  careerImpactDesc: {
    English: "Based on {country}'s economic indicators, sectors like technology, healthcare, and finance show strong growth potential. Consider upskilling in data analysis and digital tools to stay competitive.",
    Uzbek: "{country} iqtisodiy ko'rsatkichlariga asoslanib, texnologiya, sog'liqni saqlash va moliya sohalari kuchli o'sish imkoniyatlarini ko'rsatmoqda. Raqobatbardosh bo'lish uchun ma'lumotlarni tahlil qilish va raqamli vositalarni o'rganing.",
    Turkish: "{country}'nin ekonomik göstergelerine göre teknoloji, sağlık ve finans sektörleri güçlü büyüme potansiyeli göstermektedir. Rekabetçi kalmak için veri analizi ve dijital araçlarda kendinizi geliştirin.",
    Russian: "На основе экономических показателей {country} такие сектора, как технологии, здравоохранение и финансы, демонстрируют значительный потенциал роста. Рассмотрите повышение квалификации в области анализа данных.",
    Spanish: "Basándonos en los indicadores económicos de {country}, sectores como tecnología, salud y finanzas muestran un fuerte potencial de crecimiento. Considere mejorar sus habilidades en análisis de datos.",
    French: "Sur la base des indicateurs économiques de {country}, des secteurs comme la technologie, la santé et la finance montrent un fort potentiel de croissance. Envisagez de vous perfectionner en analyse de données.",
    German: "Basierend auf den Wirtschaftsindikatoren von {country} zeigen Sektoren wie Technologie, Gesundheitswesen und Finanzen starkes Wachstumspotenzial. Erwägen Sie, Ihre Fähigkeiten in Datenanalyse zu erweitern.",
    Chinese: "根据{country}的经济指标，科技、医疗和金融等行业显示出强劲的增长潜力。考虑提升数据分析和数字工具方面的技能以保持竞争力。",
    Japanese: "{country}の経済指標に基づき、テクノロジー、ヘルスケア、金融などのセクターが強い成長可能性を示しています。競争力を維持するためにデータ分析スキルを向上させてください。",
    Korean: "{country}의 경제 지표를 바탕으로 기술, 의료, 금융 분야가 강한 성장 잠재력을 보이고 있습니다. 경쟁력을 유지하기 위해 데이터 분석 역량을 향상시키세요.",
    Arabic: "استناداً إلى المؤشرات الاقتصادية لـ {country}، تُظهر قطاعات التكنولوجيا والرعاية الصحية والمالية إمكانات نمو قوية. فكر في تطوير مهاراتك في تحليل البيانات.",
    Hindi: "{country} के आर्थिक संकेतकों के आधार पर, प्रौद्योगिकी, स्वास्थ्य सेवा और वित्त जैसे क्षेत्र मजबूत विकास क्षमता दिखाते हैं। प्रतिस्पर्धी बने रहने के लिए डेटा विश्लेषण में कौशल विकसित करें।",
    Portuguese: "Com base nos indicadores económicos de {country}, sectores como tecnologia, saúde e finanças mostram forte potencial de crescimento. Considere melhorar suas habilidades em análise de dados.",
    Italian: "Sulla base degli indicatori economici di {country}, settori come tecnologia, sanità e finanza mostrano un forte potenziale di crescita. Considera di migliorare le tue competenze nell'analisi dei dati.",
    Dutch: "Op basis van de economische indicatoren van {country} tonen sectoren zoals technologie, gezondheidszorg en financiën een sterk groeipotentieel. Overweeg uw vaardigheden in data-analyse te verbeteren.",
    Polish: "Na podstawie wskaźników ekonomicznych {country}, sektory takie jak technologia, opieka zdrowotna i finanse wykazują silny potencjał wzrostu. Rozważ podniesienie kwalifikacji w zakresie analizy danych.",
    Swedish: "Baserat på {country}s ekonomiska indikatorer visar sektorer som teknik, sjukvård och finans stark tillväxtpotential. Överväg att förbättra dina kunskaper inom dataanalys.",
    Norwegian: "Basert på {country}s økonomiske indikatorer viser sektorer som teknologi, helsevesen og finans sterk vekstpotensial. Vurder å forbedre dine ferdigheter innen dataanalyse.",
    Danish: "Baseret på {country}s økonomiske indikatorer viser sektorer som teknologi, sundhedsvæsen og finans stærkt vækstpotentiale. Overvej at forbedre dine færdigheder inden for dataanalyse.",
    Finnish: "Perustuen {country}n taloudellisiin indikaattoreihin, teknologia-, terveydenhuolto- ja rahoitussektorit osoittavat vahvaa kasvupotentiaalia. Harkitse tietoanalyysitaitojen kehittämistä.",
    Ukrainian: "На основі економічних показників {country} такі сектори, як технології, охорона здоров'я та фінанси, демонструють значний потенціал зростання. Розгляньте підвищення кваліфікації в галузі аналізу даних.",
    Romanian: "Pe baza indicatorilor economici ai {country}, sectoare precum tehnologia, sănătatea și finanțele arată un potențial puternic de creștere. Luați în considerare îmbunătățirea abilităților de analiză a datelor.",
    Hungarian: "A {country} gazdasági mutatói alapján az olyan szektorok, mint a technológia, az egészségügy és a pénzügy, erős növekedési potenciált mutatnak. Fontolja meg az adatelemzési készségek fejlesztését.",
    Czech: "Na základě ekonomických ukazatelů {country} vykazují sektory jako technologie, zdravotnictví a finance silný růstový potenciál. Zvažte zlepšení dovedností v oblasti analýzy dat.",
    Greek: "Βάσει των οικονομικών δεικτών της {country}, τομείς όπως η τεχνολογία, η υγειονομική περίθαλψη και τα χρηματοοικονομικά δείχνουν ισχυρό αναπτυξιακό δυναμικό.",
    Hebrew: "בהתבסס על המדדים הכלכליים של {country}, מגזרים כמו טכנולוגיה, בריאות ופיננסים מראים פוטנציאל צמיחה חזק. שקול לשפר את כישוריך בניתוח נתונים.",
    Indonesian: "Berdasarkan indikator ekonomi {country}, sektor seperti teknologi, kesehatan, dan keuangan menunjukkan potensi pertumbuhan yang kuat. Pertimbangkan untuk meningkatkan keterampilan analisis data.",
    Malay: "Berdasarkan petunjuk ekonomi {country}, sektor seperti teknologi, penjagaan kesihatan dan kewangan menunjukkan potensi pertumbuhan yang kukuh. Pertimbangkan untuk meningkatkan kemahiran analisis data.",
    Thai: "จากตัวชี้วัดเศรษฐกิจของ{country} ภาคส่วนอย่างเทคโนโลยี การดูแลสุขภาพ และการเงิน แสดงให้เห็นถึงศักยภาพการเติบโตที่แข็งแกร่ง พิจารณาพัฒนาทักษะการวิเคราะห์ข้อมูล",
    Vietnamese: "Dựa trên các chỉ số kinh tế của {country}, các lĩnh vực như công nghệ, chăm sóc sức khỏe và tài chính cho thấy tiềm năng tăng trưởng mạnh mẽ. Hãy xem xét nâng cao kỹ năng phân tích dữ liệu.",
    Persian: "بر اساس شاخص‌های اقتصادی {country}، بخش‌هایی مانند فناوری، مراقبت‌های بهداشتی و مالی پتانسیل رشد قوی نشان می‌دهند. ارتقاء مهارت‌های تحلیل داده را در نظر بگیرید.",
    Swahili: "Kulingana na viashiria vya kiuchumi vya {country}, sekta kama teknolojia, afya na fedha zinaonyesha uwezo mkubwa wa ukuaji. Fikiria kuboresha ujuzi wako wa uchanganuzi wa data.",
    Kazakh: "{country} экономикалық көрсеткіштеріне сәйкес технология, денсаулық сақтау және қаржы салалары күшті өсу әлеуетін көрсетеді. Деректерді талдау дағдыларын дамытуды қарастырыңыз.",
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

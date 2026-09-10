import { NextResponse } from 'next/server';
import { MandiPrice } from '@/lib/types';

const DEMO_MANDI_PRICES: any[] = [
  {
    commodity: "Tomato",
    market: "Azadpur",
    district: "Delhi",
    state: "Delhi",
    min_price: "1500",
    max_price: "2500",
    modal_price: "2000",
    arrival_date: "2024-03-15"
  },
  {
    commodity: "Potato",
    market: "Agra",
    district: "Agra",
    state: "Uttar Pradesh",
    min_price: "800",
    max_price: "1200",
    modal_price: "1000",
    arrival_date: "2024-03-15"
  },
  {
    commodity: "Onion",
    market: "Lasalgaon",
    district: "Nashik",
    state: "Maharashtra",
    min_price: "1200",
    max_price: "1800",
    modal_price: "1500",
    arrival_date: "2024-03-14"
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const commodityParam = searchParams.get('commodity')?.toLowerCase();

    let records: any[] = [];
    let source: "data_gov_in" | "mock" = "data_gov_in";

    try {
      const response = await fetch(
        'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&limit=20',
        { next: { revalidate: 3600 } }
      );
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      records = data.records;
    } catch (error) {
      console.warn('Failed to fetch from data.gov.in, using mock data:', error);
      records = DEMO_MANDI_PRICES;
      source = "mock";
    }

    let parsedPrices: MandiPrice[] = records.map(record => {
      const modalPrice = parseFloat(record.modal_price);
      return {
        commodity: record.commodity,
        variety: record.variety,
        market: record.market,
        district: record.district,
        state: record.state,
        minPrice: parseFloat(record.min_price),
        maxPrice: parseFloat(record.max_price),
        modalPrice: modalPrice,
        pricePerKg: modalPrice / 100, // Transform from quintal to kg
        arrivalDate: record.arrival_date,
        source: source
      };
    });

    if (commodityParam) {
      parsedPrices = parsedPrices.filter(p => p.commodity.toLowerCase().includes(commodityParam));
    }

    // Sort by date descending
    parsedPrices.sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime());

    return NextResponse.json({ prices: parsedPrices });
  } catch (error) {
    console.error('Error in mandi-prices API:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

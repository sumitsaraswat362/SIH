import { NextResponse } from "next/server";
import { DEMO_MANDI_PRICES } from "@/data/mock-data";

// Free public API for real Indian Mandi Prices (Govt Data)
// Documentation: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
const GOV_API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"; // Provided test key

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const commodity = searchParams.get('commodity')?.toLowerCase();
    const state = searchParams.get('state');

    // 1. Try to fetch from real data.gov.in API
    try {
      let url = `${GOV_API_URL}?api-key=${API_KEY}&format=json&limit=50`;
      
      if (commodity) {
        // Map our internal crop names to eNAM/Govt commodity names if necessary
        const mappedCommodity = commodity === 'tomatoes' ? 'Tomato' : 
                               commodity === 'onions' ? 'Onion' : 
                               commodity === 'potatoes' ? 'Potato' : commodity;
        url += `&filters[commodity]=${mappedCommodity}`;
      }
      
      if (state) {
        url += `&filters[state]=${state}`;
      }

      const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
      if (res.ok) {
        const data = await res.json();
        if (data && data.records && data.records.length > 0) {
          // Transform gov data (₹/Quintal) to our format (₹/kg)
          const transformed = data.records.map((record: any) => {
            const minPrice = parseFloat(record.min_price) / 100; // 1 Quintal = 100 kg
            const maxPrice = parseFloat(record.max_price) / 100;
            const modalPrice = parseFloat(record.modal_price) / 100;
            
            return {
              id: `${record.state}-${record.market}-${record.commodity}-${record.arrival_date}`,
              state: record.state,
              district: record.district,
              market: record.market,
              commodity: record.commodity.toLowerCase(),
              variety: record.variety,
              minPriceKg: Math.round(minPrice),
              maxPriceKg: Math.round(maxPrice),
              modalPriceKg: Math.round(modalPrice),
              date: record.arrival_date
            };
          });
          
          return NextResponse.json({ success: true, source: 'gov', data: transformed });
        }
      }
    } catch (e) {
      console.warn("Gov Mandi API failed, falling back to mock data", e);
    }

    // 2. Fallback to mock data if Gov API is down or returned no results
    let fallbackData = DEMO_MANDI_PRICES;
    
    if (commodity) {
      fallbackData = fallbackData.filter(p => p.cropType.toLowerCase() === commodity);
    }
    if (state) {
      fallbackData = fallbackData.filter(p => p.state.toLowerCase() === state.toLowerCase());
    }

    // Sort by date desc
    fallbackData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ 
      success: true, 
      source: 'mock', 
      data: fallbackData 
    });

  } catch (error) {
    console.error("Mandi Prices API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mandi prices" },
      { status: 500 }
    );
  }
}

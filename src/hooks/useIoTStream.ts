import { useState, useEffect } from 'react';

export function useIoTStream(count: number = 7) {
  const [trucks, setTrucks] = useState<any[]>([]);

  useEffect(() => {
    // Initial generation
    const initial = Array.from({ length: count }).map((_, i) => {
      // Base around Maharashtra / Nashik coords
      const baseLat = 19.99 + (Math.random() - 0.5) * 2;
      const baseLng = 73.78 + (Math.random() - 0.5) * 2;
      return {
        id: `iot-truck-${i}`,
        truckPlate: `MH-${Math.floor(Math.random() * 50).toString().padStart(2, '0')}-XY-${1000 + Math.floor(Math.random() * 8999)}`,
        type: ['Apples', 'Grapes', 'Pharmaceuticals', 'Dairy', 'Seafood'][Math.floor(Math.random() * 5)],
        quantityKg: Math.floor(2000 + Math.random() * 8000),
        status: 'in_transit',
        safeTemperatureMax: 5,
        telemetry: {
          temperature: Math.random() * 7 - 2, // -2 to 5
          humidity: 80 + Math.random() * 15,
          ethyleneLevel: 'low',
          timestamp: Date.now()
        },
        origin: { name: 'Distribution Hub', location: { lat: 19.99, lng: 73.78 } },
        originalDestination: { name: 'Mumbai Port', location: { lat: 18.96, lng: 72.84 } },
        currentLocation: { lat: baseLat, lng: baseLng },
        createdAt: Date.now()
      };
    });
    setTrucks(initial);

    const interval = setInterval(() => {
      setTrucks((prev) => 
        prev.map((truck) => {
          // Fluctuate temp by -0.5 to +0.5
          let newTemp = truck.telemetry.temperature + (Math.random() - 0.5);
          if (newTemp < -2) newTemp = -2;
          if (newTemp > 8) newTemp = 8;
          
          let newStatus = truck.status;
          if (newTemp > 5) newStatus = 'warning';
          if (newTemp > 7) newStatus = 'emergency';
          if (newTemp <= 5) newStatus = 'in_transit';

          return {
            ...truck,
            status: newStatus,
            telemetry: {
              ...truck.telemetry,
              temperature: newTemp,
              timestamp: Date.now()
            },
            currentLocation: {
              lat: truck.currentLocation.lat + (Math.random() - 0.5) * 0.01,
              lng: truck.currentLocation.lng + (Math.random() - 0.5) * 0.01,
            }
          };
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [count]);

  return trucks;
}

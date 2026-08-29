"use server";

import { getARIMAForecast } from "../../lib/bigquery-client";

export async function fetchArimaForecast() {
  return await getARIMAForecast();
}

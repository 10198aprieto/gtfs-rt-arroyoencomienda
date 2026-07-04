import { defineMcp } from "@lovable.dev/mcp-js";
import searchStopsTool from "./tools/search-stops";
import nextArrivalsTool from "./tools/next-arrivals";
import activeAlertsTool from "./tools/active-alerts";

export default defineMcp({
  name: "arroyobus-mcp",
  title: "ArroyoBus",
  version: "0.1.0",
  instructions:
    "Herramientas del transporte urbano de Arroyo de la Encomienda (ArroyoBus). Usa `search_stops` para localizar una parada por número o nombre, `next_arrivals` para consultar las próximas llegadas en tiempo real y `active_alerts` para avisos de servicio.",
  tools: [searchStopsTool, nextArrivalsTool, activeAlertsTool],
});
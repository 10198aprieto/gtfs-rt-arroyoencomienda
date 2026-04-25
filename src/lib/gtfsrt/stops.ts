// All ArroyoBus stop IDs (sincronizado con GTFS estático v20.2.5: paradas 1–73).
// Los nombres y coordenadas vienen del feed GTFS-RT de ActioSAE, así que aquí
// solo mantenemos los IDs vigentes para no consultar paradas fantasma.
export const STOP_IDS = Array.from({ length: 73 }, (_, i) => String(i + 1));

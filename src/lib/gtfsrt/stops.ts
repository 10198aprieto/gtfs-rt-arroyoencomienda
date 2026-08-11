// All ArroyoBus stop IDs (sincronizado con GTFS estático v21.1: paradas 1–74).
// Los nombres y coordenadas vienen del feed GTFS-RT de ActioSAE, así que aquí
// solo mantenemos los IDs vigentes para no consultar paradas fantasma.
export const STOP_IDS = Array.from({ length: 74 }, (_, i) => String(i + 1));

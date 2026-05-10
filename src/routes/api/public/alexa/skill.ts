import { createFileRoute } from "@tanstack/react-router";
import { lookupStop } from "@/lib/voice/query.server";

function speak(text: string, endSession = false, reprompt?: string) {
  return Response.json({
    version: "1.0",
    response: {
      outputSpeech: { type: "PlainText", text },
      ...(reprompt
        ? { reprompt: { outputSpeech: { type: "PlainText", text: reprompt } } }
        : {}),
      shouldEndSession: endSession,
    },
  });
}

const WELCOME =
  "Bienvenido a Arroyo Bus. Puedes preguntarme por las próximas llegadas a una parada. Por ejemplo: «próximo bus en la parada 100». ¿Qué parada quieres consultar?";
const HELP =
  "Puedo decirte las próximas llegadas de los autobuses de Arroyo de la Encomienda. Dime el número o el nombre de una parada.";

function extractStopQuery(intent: any): string {
  const slots = intent?.slots || {};
  const candidates = ["parada", "stop", "Stop", "Parada", "numero", "name"];
  for (const k of candidates) {
    const v = slots[k]?.value;
    if (v && String(v).trim()) return String(v).trim();
  }
  // Fallback: first slot with a value
  for (const k of Object.keys(slots)) {
    const v = slots[k]?.value;
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

export const Route = createFileRoute("/api/public/alexa/skill")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({ ok: true, hint: "Alexa skill endpoint (POST JSON from Alexa)." }),
      POST: async ({ request }) => {
        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        // Optional skill ID verification
        const expectedSkillId = process.env.ALEXA_SKILL_ID;
        const incomingSkillId = payload?.session?.application?.applicationId
          ?? payload?.context?.System?.application?.applicationId;
        if (expectedSkillId && incomingSkillId && expectedSkillId !== incomingSkillId) {
          return new Response("Forbidden", { status: 403 });
        }

        const type: string = payload?.request?.type || "";

        try {
          if (type === "LaunchRequest") {
            return speak(WELCOME, false, "¿Qué parada quieres consultar?");
          }

          if (type === "SessionEndedRequest") {
            return new Response("", { status: 200 });
          }

          if (type === "IntentRequest") {
            const intent = payload.request.intent;
            const name: string = intent?.name || "";

            if (name === "AMAZON.HelpIntent") return speak(HELP, false, "¿Qué parada?");
            if (name === "AMAZON.StopIntent" || name === "AMAZON.CancelIntent") {
              return speak("Hasta pronto.", true);
            }

            // ParadaIntent (or any custom intent we wire) — extract the stop slot
            const q = extractStopQuery(intent);
            if (!q) {
              return speak(
                "Dime el número o el nombre de la parada que quieres consultar.",
                false,
                "¿Qué parada?"
              );
            }
            const r = await lookupStop(q);
            return speak(r.speech, true);
          }

          return speak(WELCOME, false, "¿Qué parada quieres consultar?");
        } catch (e) {
          console.error("alexa skill error", e);
          return speak("Lo siento, ha ocurrido un error consultando los autobuses.", true);
        }
      },
    },
  },
});
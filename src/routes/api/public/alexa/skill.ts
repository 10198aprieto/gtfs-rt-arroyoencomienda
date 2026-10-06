import { createFileRoute } from "@tanstack/react-router";
import { handleIntent, WELCOME } from "@/lib/voice/alexa-intents.server";

function speak(text: string, endSession = false, reprompt?: string, session?: Record<string, unknown>) {
  return Response.json({
    version: "1.0",
    ...(session ? { sessionAttributes: session } : {}),
    response: {
      outputSpeech: { type: "PlainText", text },
      card: { type: "Simple", title: "ArroyoBus", content: text },
      ...(reprompt ? { reprompt: { outputSpeech: { type: "PlainText", text: reprompt } } } : {}),
      shouldEndSession: endSession,
    },
  });
}

export const Route = createFileRoute("/api/public/alexa/skill")({
  server: {
    handlers: {
      GET: async () => Response.json({ ok: true, hint: "Alexa skill endpoint (POST JSON from Alexa)." }),
      POST: async ({ request }) => {
        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const expectedSkillId = process.env.ALEXA_SKILL_ID;
        const incomingSkillId =
          payload?.session?.application?.applicationId ?? payload?.context?.System?.application?.applicationId;
        if (expectedSkillId && incomingSkillId && expectedSkillId !== incomingSkillId) {
          return new Response("Forbidden", { status: 403 });
        }

        const type: string = payload?.request?.type || "";
        const attrs = payload?.session?.attributes || {};
        try {
          if (type === "SessionEndedRequest") return new Response("", { status: 200 });
          if (type === "IntentRequest") {
            const r = await handleIntent(payload.request.intent, attrs);
            return speak(r.speech, r.end, r.reprompt, { ...attrs, ...(r.session || {}) });
          }
          return speak(WELCOME, false, "¿Qué quieres saber?");
        } catch (e) {
          console.error("alexa skill error", e);
          return speak("Lo siento, ha ocurrido un error consultando los autobuses.", true);
        }
      },
    },
  },
});

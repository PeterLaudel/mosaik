import dayjs from "dayjs";
import { getSessionsRepository, getTherapeutsRepository } from "@/server";
import { generateText } from "./ollamaClient";
import { PSEUDONYMIZATION_SYSTEM_PROMPT, buildPseudonymizationUserMessage } from "./prompts/pseudonymization";

interface PseudonymizationContext {
  patientName: string;
  patientSurname: string;
  patientBirthdate: string;
  patientCity: string;
  patientStreet: string;
  therapeutNames: { name: string; surname: string }[];
}

export async function pseudonymizeSession(sessionId: number): Promise<void> {
  const sessionsRepository = await getSessionsRepository();
  const session = await sessionsRepository.find(sessionId);

  try {
    const therapeutsRepository = await getTherapeutsRepository();
    const therapeuts = await therapeutsRepository.all();

    const context: PseudonymizationContext = {
      patientName: session.patient.name,
      patientSurname: session.patient.surname,
      patientBirthdate: session.patient.birthdate,
      patientCity: session.patient.address.city,
      patientStreet: session.patient.address.street,
      therapeutNames: therapeuts,
    };

    const [pseudonymizedNotes, pseudonymizedNextPlan] = await Promise.all([
      pseudonymizeText(session.clinicalNotes, context),
      pseudonymizeText(session.nextSessionPlan, context),
    ]);

    await sessionsRepository.update({
      ...session,
      pseudonymizedNotes,
      pseudonymizedNextPlan,
      pseudonymizationStatus: "done",
    });
  } catch (error) {
    await sessionsRepository.update({ ...session, pseudonymizationStatus: "failed" });
    throw error;
  }
}

async function pseudonymizeText(text: string | null, context: PseudonymizationContext): Promise<string | null> {
  if (!text) return null;

  const ruleBasedText = applyRuleBasedPass(text, context);
  return await generateText(PSEUDONYMIZATION_SYSTEM_PROMPT, buildPseudonymizationUserMessage(ruleBasedText));
}

function applyRuleBasedPass(text: string, context: PseudonymizationContext): string {
  let result = text;

  // Replace the full "Vorname Nachname" first so it collapses to a single placeholder
  // instead of leaving two adjacent placeholders from separate first/last name replacements.
  result = replaceAllOccurrences(result, `${context.patientName} ${context.patientSurname}`, "[Patient]");
  result = replaceAllOccurrences(result, context.patientName, "[Patient]");
  result = replaceAllOccurrences(result, context.patientSurname, "[Patient]");
  result = replaceAllOccurrences(result, formatGermanDate(context.patientBirthdate), "[Geburtsdatum]");
  result = replaceAllOccurrences(result, context.patientBirthdate, "[Geburtsdatum]");
  result = replaceAllOccurrences(result, context.patientCity, "[Ort]");
  result = replaceAllOccurrences(result, context.patientStreet, "[Ort]");

  for (const therapeut of context.therapeutNames) {
    result = replaceAllOccurrences(result, `${therapeut.name} ${therapeut.surname}`, "[Therapeut]");
    result = replaceAllOccurrences(result, therapeut.name, "[Therapeut]");
    result = replaceAllOccurrences(result, therapeut.surname, "[Therapeut]");
  }

  return result;
}

function formatGermanDate(isoDate: string): string {
  return dayjs(isoDate).format("DD.MM.YYYY");
}

function replaceAllOccurrences(text: string, needle: string, placeholder: string): string {
  if (!needle) return text;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`\\b${escaped}\\b`, "gi"), placeholder);
}

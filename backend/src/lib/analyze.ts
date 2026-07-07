import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Kept internal. Never sent to the client, never referenced by name in the UI.
const SYSTEM_PROMPT = `You are a careful medical-report reading assistant embedded in a
consumer health product called MedInsight. You read a single uploaded lab/medical report
and turn it into a plain-language summary for a non-clinical reader.

Rules:
- You are not diagnosing anything. Never say what condition someone has or prescribe treatment.
- Be accurate and conservative. If a value's reference range isn't in the document, say so
  rather than guessing a status.
- Write for someone with no medical background: short sentences, no unexplained jargon.
- Always end by pointing to a licensed clinician for anything that needs medical judgment.

Respond with ONLY a single JSON object matching exactly this shape, no prose, no markdown fences:

{
  "summary": "2-4 sentence plain-language overview of the report",
  "findings": [
    { "test": "string", "value": "string", "status": "normal" | "borderline" | "attention" }
  ],
  "explanations": "A few short paragraphs explaining, in plain language, what the notable findings mean.",
  "recommendations": ["short practical wellness suggestion", "..."],
  "recommendation_status": "normal" | "borderline" | "attention"
}

"recommendation_status" should reflect the single most significant finding in the report.
If the document does not look like a medical report at all, still return valid JSON with an
empty "findings" array and explain that clearly in "summary".`;

export interface AnalysisResult {
  summary: string;
  findings: { test: string; value: string; status: "normal" | "borderline" | "attention" }[];
  explanations: string;
  recommendations: string[];
  recommendation_status: "normal" | "borderline" | "attention";
}

async function runAnalysis(fileBuffer: Buffer, mimeType: string, fileName: string): Promise<AnalysisResult> {
  // Gemini reads PDFs and images directly — no separate text-extraction step needed.
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent([
    { inlineData: { data: fileBuffer.toString("base64"), mimeType } },
    { text: `Report file name: ${fileName}. Read this medical report and respond with the JSON object described in your instructions.` },
  ]);

  const text = result.response.text();
  return JSON.parse(text) as AnalysisResult;
}

/**
 * Processes a stored report: runs it through the analysis pipeline and writes
 * the result to the database. Designed to be called right after upload
 * (fire-and-forget) or by a retry/cron job.
 */
export async function processReport(reportId: string): Promise<void> {
  const { rows } = await pool.query(
    "select id, file_name, mime_type, file_data from reports where id = $1",
    [reportId]
  );
  const report = rows[0];
  if (!report) return;

  try {
    const result = await runAnalysis(report.file_data, report.mime_type, report.file_name);

    await pool.query(
      `insert into analysis_results (report_id, summary, findings, explanations, recommendations, recommendation_status)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (report_id) do update set
         summary = excluded.summary,
         findings = excluded.findings,
         explanations = excluded.explanations,
         recommendations = excluded.recommendations,
         recommendation_status = excluded.recommendation_status,
         created_at = now()`,
      [
        reportId,
        result.summary,
        JSON.stringify(result.findings ?? []),
        result.explanations,
        JSON.stringify(result.recommendations ?? []),
        result.recommendation_status,
      ]
    );

    await pool.query("update reports set status = 'completed' where id = $1", [reportId]);
  } catch (err) {
    console.error(`Analysis failed for report ${reportId}:`, err);
    await pool.query("update reports set status = 'failed' where id = $1", [reportId]);
  }
}

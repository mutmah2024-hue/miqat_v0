import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

import { Mistral } from "@mistralai/mistralai";

function extractContent(content) {
	if (typeof content === "string") {
		return content;
	}

	if (Array.isArray(content)) {
		return content
			.map((part) => {
				if (typeof part === "string") {
					return part;
				}

				if (part?.text) {
					return part.text;
				}

				return "";
			})
			.join("");
	}

	if (content && typeof content === "object") {
		if (typeof content.text === "string") {
			return content.text;
		}

		if (typeof content.content === "string") {
			return content.content;
		}

		return JSON.stringify(content);
	}

	return "";
}

export async function POST(request) {
	try {
		const body = await request.json();

		const filePath = body?.filePath;
		const materialName = body?.materialName;
		const topicName = body?.topicName;

		if (!filePath) {
			return NextResponse.json(
				{
					error: "File path is required.",
				},
				{ status: 400 }
			);
		}

		if (!process.env.MISTRAL_API_KEY) {
			return NextResponse.json(
				{
					error: "MISTRAL_API_KEY is missing.",
				},
				{ status: 500 }
			);
		}

		const {
			data: signedUrlData,
			error: signedUrlError,
		} = await supabaseAdmin.storage
			.from("study-materials")
			.createSignedUrl(filePath, 60 * 10);

		if (signedUrlError) {
			console.error(
				"Supabase signed URL error:",
				signedUrlError
			);

			return NextResponse.json(
				{
					error: "Unable to access the study PDF.",
				},
				{ status: 500 }
			);
		}

		const mistral = new Mistral({
			apiKey: process.env.MISTRAL_API_KEY,
		});

		const response = await mistral.chat.complete({
			model: "ministral-8b-2512",

			messages: [
				{
					role: "system",
					content:
						"You are Mīqāt Study AI. Your job is to create accurate, useful flashcards from educational material. Use only information supported by the provided document. Do not invent facts. Focus on information that is important for understanding and exam preparation.",
				},

				{
					role: "user",

					content: [
						{
							type: "text",

							text: `
Create comprehensive study flashcards from this educational material.

Topic:
${topicName || "Unknown topic"}

Material:
${materialName || "Study material"}

Return ONLY a valid JSON object with this exact structure:

{
  "flashcards": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}

Requirements:

1. Base every flashcard strictly on the provided document.
2. Create flashcards from the important information in the material, not random or trivial details.
3. Cover important definitions, facts, processes, functions, classifications, differences, formulas, relationships, examples, and exceptions when they are present in the document.
4. Make questions clear and specific enough that the student can answer them without seeing the original notes.
5. Make answers accurate and sufficiently detailed to contain the important information from the document.
6. Do not make the answers unnecessarily long.
7. Avoid duplicate or nearly identical flashcards.
8. Break large topics into multiple focused flashcards where appropriate.
9. Preserve important technical terms and terminology from the document.
10. Include important exam-relevant details.
11. Do not add information that is not supported by the material.
12. Do not create vague questions such as "What do you know about this topic?"
13. Do not turn every sentence in the document into a flashcard. Select and organize the important information.
14. Return enough flashcards to cover the important material comprehensively.
15. Return JSON only.
`,
						},

						{
							type: "document_url",
							documentUrl:
								signedUrlData.signedUrl,
						},
					],
				},
			],

			responseFormat: {
				type: "json_object",
			},
		});

		const rawContent =
			response.choices?.[0]?.message?.content;

		if (!rawContent) {
			throw new Error(
				"No Flashcards were returned."
			);
		}

		const content = extractContent(rawContent);

		if (!content) {
			throw new Error(
				"No usable Flashcards content was returned."
			);
		}

		console.log(
			"Flashcards raw Mistral content:",
			content
		);

		let flashcards;

		try {
			const cleanedContent = content
				.replace(/^```json\s*/i, "")
				.replace(/^```\s*/i, "")
				.replace(/\s*```$/i, "")
				.trim();

			flashcards =
				JSON.parse(cleanedContent);
		} catch (parseError) {
			console.error(
				"Flashcards JSON parse error:",
				parseError
			);

			console.error(
				"Flashcards content that failed to parse:",
				content
			);

			throw new Error(
				"Mīqāt AI returned invalid Flashcards data."
			);
		}

		if (
			!flashcards ||
			!Array.isArray(flashcards.flashcards)
		) {
			throw new Error(
				"Mīqāt AI returned Flashcards in an unexpected format."
			);
		}

		return NextResponse.json({
			success: true,
			flashcards,
		});
	} catch (error) {
		console.error(
			"Flashcards generation error:",
			error
		);

		return NextResponse.json(
			{
				error:
					error.message ||
					"Unable to generate Flashcards.",
			},
			{ status: 500 }
		);
	}
}
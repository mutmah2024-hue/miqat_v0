import { NextResponse } from "next/server";

import {
	supabaseAdmin,
} from "../../../../lib/supabaseAdmin";

import {
	Mistral,
} from "@mistralai/mistralai";

export async function POST(request) {
	try {
		const body = await request.json();

		const filePath = body?.filePath;
		const materialName = body?.materialName;
		const topicName = body?.topicName;

		if (!filePath) {
			return NextResponse.json(
				{
					error:
						"File path is required.",
				},
				{status: 400}
			);
		}

		if (!process.env.MISTRAL_API_KEY) {
			return NextResponse.json(
				{
					error:
						"MISTRAL_API_KEY is missing.",
				},
				{status: 500}
			);
		}

		const {
			data: signedUrlData,
			error: signedUrlError,
		} =
			await supabaseAdmin.storage
				.from("study-materials")
				.createSignedUrl(
					filePath,
					60 * 10
				);

		if (signedUrlError) {
			console.error(
				"Supabase signed URL error:",
				signedUrlError
			);

			return NextResponse.json(
				{
					error:
						"Unable to access the study PDF.",
				},
				{status: 500}
			);
		}

		const mistral = new Mistral({
			apiKey:
				process.env.MISTRAL_API_KEY,
		});

		const response =
			await mistral.chat.complete({
				model: "ministral-8b-2512",

				messages: [
					{
						role: "system",
						content:
							"You are Wasl Study AI. Your job is to transform educational material into clear, accurate, student-friendly study content. Use only information supported by the provided document. Do not invent facts. Explain difficult ideas simply while preserving important technical details.",
					},

					{
						role: "user",

						content: [
							{
								type: "text",
								text: `
Create a comprehensive Study Guide from this educational material.

Topic:
${topicName || "Unknown topic"}

Material:
${materialName || "Study material"}

Return ONLY a valid JSON object with this exact structure:

{
  "title": "string",
  "overview": "string",
  "keyConcepts": [
    {
      "title": "string",
      "explanation": "string"
    }
  ],
  "sections": [
    {
      "title": "string",
      "summary": "string",
      "importantPoints": [
        "string"
      ]
    }
  ],
  "examFocus": [
    "string"
  ]
}

Requirements:

1. Base the guide on the document.
2. Cover the major concepts in the material.
3. Explain concepts clearly for a student.
4. Preserve important definitions, processes, formulas, classifications, examples, and relationships.
5. Highlight information that is especially useful for exam preparation.
6. Do not add information that is not supported by the material.
7. Return JSON only.
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

		const content =
			response.choices?.[0]?.message
				?.content;

		if (!content) {
			throw new Error(
				"No Study Guide was returned."
			);
		}

		let studyGuide;

		try {
			studyGuide =
				JSON.parse(content);
		} catch (parseError) {
			console.error(
				"Study Guide JSON parse error:",
				parseError
			);

			throw new Error(
				"Wasl AI returned invalid Study Guide data."
			);
		}

		return NextResponse.json({
			success: true,
			studyGuide,
		});
	} catch (error) {
		console.error(
			"Study Guide generation error:",
			error
		);

		return NextResponse.json(
			{
				error:
					error.message ||
					"Unable to generate the Study Guide.",
			},
			{status: 500}
		);
	}
}
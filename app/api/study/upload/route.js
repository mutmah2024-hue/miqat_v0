import { NextResponse } from "next/server";

import {
	supabaseAdmin,
} from "../../../../lib/supabaseAdmin";

export async function POST(request) {
	try {
		const formData = await request.formData();

		const file = formData.get("file");
		const userId = formData.get("userId");
		const topicId = formData.get("topicId");

		if (!file) {
			return NextResponse.json(
				{
					error: "No file was provided.",
				},
				{status: 400}
			);
		}

		if (!userId || !topicId) {
			return NextResponse.json(
				{
					error:
						"User ID and topic ID are required.",
				},
				{status: 400}
			);
		}

		if (
			file.type !== "application/pdf"
		) {
			return NextResponse.json(
				{
					error:
						"Only PDF files are allowed.",
				},
				{status: 400}
			);
		}

		if (file.size > 50 * 1024 * 1024) {
			return NextResponse.json(
				{
					error:
						"PDF files must be 50 MB or smaller.",
				},
				{status: 400}
			);
		}

		const fileBuffer =
			Buffer.from(
				await file.arrayBuffer()
			);

		const safeFileName = file.name
			.replace(/[^a-zA-Z0-9._-]/g, "_");

		const filePath =
			`${userId}/${topicId}/${Date.now()}-${safeFileName}`;

		const {data, error} =
			await supabaseAdmin.storage
				.from("study-materials")
				.upload(
					filePath,
					fileBuffer,
					{
						contentType:
							"application/pdf",
						upsert: false,
					}
				);

		if (error) {
			console.error(
				"Supabase upload error:",
				error
			);

			return NextResponse.json(
				{
					error:
						"Unable to upload the PDF.",
				},
				{status: 500}
			);
		}

		return NextResponse.json({
			success: true,
			filePath: data.path,
		});
	} catch (error) {
		console.error(
			"Upload route error:",
			error
		);

		return NextResponse.json(
			{
				error:
					"Something went wrong while uploading the PDF.",
			},
			{status: 500}
		);
	}
}
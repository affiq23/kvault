// src/app/api/upload/route.ts
// handles file uploads and extraction
import { createServerClient } from "../../../../lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import type {
  TextItem,
  TextMarkedContent,
} from "pdfjs-dist/types/src/display/api";
import { getDocument } from "pdfjs-serverless";

// function to extract text using pdfjs-serverless
// uses raw file contents and returns extracted text
async function extractTextFromFile(
  fileData: Buffer,
  fileExtension: string
): Promise<string> {
  console.log(`Starting text extraction for ${fileExtension} file...`);

  // PDF extraction
  try {
    if (fileExtension === ".pdf") {
      console.log("Loading PDF with pdfjs-serverless...");

      // store file content in doc object and standarize text font
      const data = new Uint8Array(fileData);
      const doc = await getDocument({ data, useSystemFonts: true }).promise;

      // create object to store all text content
      console.log(`PDF loaded successfully. Pages: ${doc.numPages}`);
      const allText: string[] = [];

      // loop through pages
      for (let i = 1; i <= doc.numPages; i++) {
        try {
          console.log(`Processing page ${i}...`);
          const page = await doc.getPage(i);
          const textContent = await page.getTextContent(); // get content on current page

          // handle content safely; only add actual text, not marks or annotations
          const contents = textContent.items
            .map((item: TextItem | TextMarkedContent) =>
              "str" in item ? item.str : ""
            )
            .join(" ");
          allText.push(contents); // add page content to object
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          allText.push(`[Error extracting text from page ${i}]`);
        }
      }

      // combine all text into one page
      const combinedText = allText.join("\n");
      console.log(
        `PDF extraction completed. Text length: ${combinedText.length}`
      );
      return (
        combinedText.trim() ||
        "[PDF processed successfully but no readable text found]"
      );

      // TXT extraction
    } else if (fileExtension === ".txt" || fileExtension === ".md") {
      console.log("Processing text file...");
      const text = fileData.toString("utf-8");
      console.log(`Text file processed. Length: ${text.length}`);
      return text;

      // PPTX extraction
    } else if (fileExtension === ".pptx") {
      console.log("Processing PowerPoint file...");

      try {
        // use dynamic import to load module when needed
        const PptxParser = (await import("node-pptx-parser")).default;
        const fs = await import("fs/promises");
        const path = await import("path");
        const os = await import("os");

        // create temp file to write buffer
        // give it safe temp folder and unique name
        const tempFilePath = path.join(
          os.tmpdir(),
          `upload_${Date.now()}.pptx`
        );
        await fs.writeFile(tempFilePath, fileData);

        // create parser and array of slide objects representing text in that slide
        const parser = new PptxParser(tempFilePath);
        const slides = await parser.extractText();

        // combine text on slide into string, then combine all slides into one big string
        const allText = slides
          .map((slide) => slide.text.join("\n"))
          .join("\n\n");
        await fs.unlink(tempFilePath); // delete temp file

        console.log(
          `PPTX text extraction completed. Length: ${allText.length}`
        );
        return allText || "[PPTX processed but no readable text found]";
      } catch (pptxError) {
        console.error("PPTX extraction error:", pptxError);
        return "[PowerPoint extraction failed]";
      }
    }

    // fallback for unsupported file types
    return `[File type ${fileExtension} is not supported for text extraction]`;
  } catch (error) {
    console.error(`Error extracting text from ${fileExtension}:`, error);
    return `[${fileExtension} file uploaded successfully - text extraction failed: ${
      error instanceof Error ? error.message : "unknown error"
    }]`;
  }
}

export async function POST(req: NextRequest) {
  try {
    // grab auth header from request
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    // Supabase client
    const supabase = createServerClient(authHeader);

    // verify user token is valid
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    // parse multipart form data sent from client
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // validate file type
    const allowedTypes = [".pdf", ".pptx", ".txt", ".md"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        {
          error: `File type ${fileExtension} not allowed. Allowed types: ${allowedTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // validate file size (10 MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${
            maxSizeInBytes / (1024 * 1024)
          }MB`,
        },
        { status: 400 }
      );
    }

    // convert file to format Supabase storage can read
    const fileData = new Uint8Array(await file.arrayBuffer());

    // create unique filename structure
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${user.id}/${timestamp}_${sanitizedFileName}`;

    // upload actual file content to Supabase bucket
    const { data, error: uploadError } = await supabase.storage
      .from("user-uploads")
      .upload(fileName, fileData, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        {
          error: uploadError.message || "Upload failed",
        },
        { status: 500 }
      );
    }

    // extract text from uploaded file using pdfjs-serverless
    let extractedText: string | null = null;

    console.log(
      `Starting text extraction for ${fileExtension} file: ${file.name}`
    );

    try {
      const buffer = Buffer.from(fileData);
      extractedText = await extractTextFromFile(buffer, fileExtension);

      console.log(
        `Text extraction completed. Final length: ${extractedText.length}`
      );
    } catch (extractError) {
      console.error("Text extraction error:", extractError);
      extractedText = `[Text extraction failed: ${
        extractError instanceof Error ? extractError.message : "Unknown error"
      }]`;
    }

    // save file metadata to database for easy indexing
    const { error: dbError } = await supabase.from("files").insert({
      user_id: user.id,
      file_name: file.name,
      storage_path: data.path,
      extracted_text: extractedText,
    });

    if (dbError) {
      console.error("Database save error:", dbError);
      return NextResponse.json(
        {
          error:
            "File uploaded but failed to save metadata: " + dbError.message,
        },
        { status: 500 }
      );
    }

    // get public URL for file
    const { data: urlData } = supabase.storage
      .from("user-uploads")
      .getPublicUrl(fileName);

    return NextResponse.json({
      message: "File uploaded successfully",
      path: data?.path,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      url: urlData.publicUrl,
      userId: user.id,
      extractedText: extractedText || undefined,
      fileType: fileExtension,
      textExtractionSuccess: extractedText
        ? !extractedText.includes("[")
        : false,
    });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

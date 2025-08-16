// src/app/api/upload/route.ts
import { createServerClient } from "../../../../lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// run function when POST request is made
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
    // creates structure like:
     // user-uploads/
    //   ├── user-123/
    //   │   ├── 1641234567890_document.pdf
    //   │   └── 1641234568123_presentation.pptx
    //   └── user-456/
    //       └── 1641234569456_notes.txt
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // Remove special chars
    const fileName = `${user.id}/${timestamp}_${sanitizedFileName}`;

    // upload actual file content to Supabase bucket
    const { data, error: uploadError } = await supabase.storage
      .from("user-uploads")
      .upload(fileName, fileData, {
        cacheControl: "3600", // cache for one hour
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

    // save file metadata to database for easy indexing
    const { error: dbError } = await supabase.from("files").insert({
      user_id: user.id,
      file_name: file.name,
      storage_path: data.path, // path in storage
    });

    if (dbError) {
      console.error("Database save error:", dbError);
      // File was uploaded to storage but failed to save to database
      // You might want to delete the file from storage here or handle this case
      return NextResponse.json(
        {
          error:
            "File uploaded but failed to save metadata: " + dbError.message,
        },
        { status: 500 }
      );
    }

    // get public URL for file: NEED TO DISPLAY
    const { data: urlData } = supabase.storage
      .from("user-uploads")
      .getPublicUrl(fileName);

    return NextResponse.json({
      message: "File uploaded successfully",
      path: data?.path, // storage path
      fileName: file.name, // original name
      fileSize: file.size, // file size in bytes
      uploadedAt: new Date().toISOString(), // timestamp of upload
      url: urlData.publicUrl, // direct access URL
      userId: user.id,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
        error: err.message || "Upload failed",
      },
      { status: 500 }
    );
  }
}

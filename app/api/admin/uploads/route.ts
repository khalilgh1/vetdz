import { resolveApiError } from "@/app/api/admin/_shared";
import { uploadProductImageBuffer } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILES = 8;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

function toImageFiles(values: FormDataEntryValue[]) {
    const files = values.filter((value): value is File => value instanceof File);

    if (files.length !== values.length) {
        throw new Error("INVALID_UPLOAD_FILE");
    }

    if (files.length === 0) {
        throw new Error("UPLOAD_FILES_REQUIRED");
    }

    if (files.length > MAX_FILES) {
        throw new Error("TOO_MANY_UPLOAD_FILES");
    }

    for (const file of files) {
        if (!file.type.startsWith("image/")) {
            throw new Error("INVALID_UPLOAD_FILE");
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new Error("UPLOAD_FILE_TOO_LARGE");
        }
    }

    return files;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = toImageFiles(formData.getAll("images"));

        const items = await Promise.all(
            files.map(async (file) => {
                const buffer = Buffer.from(await file.arrayBuffer());
                return uploadProductImageBuffer(buffer, file.name);
            })
        );

        return Response.json({ items }, { status: 201 });
    } catch (error) {
        const resolved = resolveApiError(error);
        return Response.json({ error: resolved.message }, { status: resolved.status });
    }
}

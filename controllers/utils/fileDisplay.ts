export type FileRole = "doc" | "sheet" | "archive" | "image" | "media" | "other";

export interface FileKind {
    label: string;
    role: FileRole;
}

const FILE_KINDS: { match: RegExp; kind: FileKind }[] = [
    { match: /^application\/pdf$/,              kind: { label: "PDF",   role: "doc" } },
    { match: /msword|wordprocessingml/,         kind: { label: "DOCX",  role: "doc" } },
    { match: /spreadsheetml|ms-excel/,          kind: { label: "XLSX",  role: "sheet" } },
    { match: /^text\/csv$/,                     kind: { label: "CSV",   role: "sheet" } },
    { match: /zip|compressed|x-tar|x-7z|x-rar/, kind: { label: "ZIP",   role: "archive" } },
    { match: /^image\//,                        kind: { label: "IMAGE", role: "image" } },
    { match: /^(video|audio)\//,                kind: { label: "MEDIA", role: "media" } },
];

export const getFileKind = (mimeType: string): FileKind =>
    FILE_KINDS.find(({ match }) => match.test(mimeType))?.kind ?? {
        label: (mimeType.split("/")[1] || "FILE").toUpperCase().slice(0, 6),
        role: "other",
    };

export const formatBytes = (bytes: number | bigint | null | undefined): string => {
    if (bytes == null) return "—";
    const units = ["B", "KB", "MB", "GB"];
    let n = Number(bytes);
    let i = 0;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

// Structural constraint, so it works with the Prisma File type without importing it
export const toFileRow = <T extends { mimeType: string; size?: number | bigint | null }>(file: T) => ({
    ...file,
    kind: getFileKind(file.mimeType),
    sizeLabel: formatBytes(file.size),
});
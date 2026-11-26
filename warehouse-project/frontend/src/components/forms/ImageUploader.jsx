import { useEffect, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../ui/Avatar";
import Spinner from "../ui/Spinner";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImageUploader({
  value,
  onChange,
  onUpload,
  label = "Profile image",
}) {
  const [preview, setPreview] = useState(value?.url ?? "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(value?.url ?? "");
  }, [value?.url]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Images must be 5 MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    try {
      const uploaded = await onUpload(file);
      if (!uploaded?.url || !uploaded?.fileId) {
        throw new Error("The upload response did not include an image URL and file ID.");
      }
      setPreview(uploaded.url);
      onChange({ url: uploaded.url, fileId: uploaded.fileId });
      toast.success("Image uploaded.");
    } catch (error) {
      setPreview("");
      onChange(null);
      toast.error(error?.response?.data?.message ?? error?.message ?? "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-white/15 bg-elevated/60 p-4">
        {preview ? (
          <Avatar name="Image preview" src={preview} size="lg" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-500">
            <ImagePlus size={22} aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:border-primary-400/40 hover:bg-primary-500/10">
            {uploading ? <Spinner size={4} label="Uploading image" /> : <UploadCloud size={16} aria-hidden="true" />}
            {uploading ? "Uploading..." : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={uploading}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">JPEG, PNG, WebP, or GIF. Maximum 5 MB.</p>
        </div>
      </div>
    </div>
  );
}

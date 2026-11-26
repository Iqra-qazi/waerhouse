import { useState } from "react";

export default function LandingImage({
  src,
  alt,
  loading = "lazy",
  className = "",
  fetchPriority,
  position = "relative",
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`${position === "absolute" ? "absolute" : "relative"} isolate overflow-hidden bg-gradient-to-br from-slate-700 via-primary-950 to-page ${className}`}
    >
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

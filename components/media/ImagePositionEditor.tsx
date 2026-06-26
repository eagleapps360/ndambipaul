"use client";

import Image from "next/image";

export default function ImagePositionEditor({
  label,
  imageUrl,
  x,
  y,
  onXChange,
  onYChange,
}: {
  label: string;
  imageUrl: string | null;
  x: number;
  y: number;
  onXChange: (value: number) => void;
  onYChange: (value: number) => void;
}) {
  return (
    <div className="imagePositionEditor">
      <div className="imagePositionEditorHeader">
        <strong>{label}</strong>
        <span>
          {x}% {y}%
        </span>
      </div>
      <div className="imagePositionPreview">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={label}
            fill
            sizes="240px"
            className="imagePositionPreviewImage"
            unoptimized={!imageUrl.startsWith("/")}
            style={{ objectPosition: `${x}% ${y}%` }}
          />
        ) : (
          <div className="imagePositionPreviewEmpty">Choose an image to adjust its focal point.</div>
        )}
      </div>
      <div className="imagePositionControls">
        <label>
          Horizontal focus
          <input type="range" min="0" max="100" value={x} onChange={(event) => onXChange(Number(event.target.value))} />
        </label>
        <label>
          Vertical focus
          <input type="range" min="0" max="100" value={y} onChange={(event) => onYChange(Number(event.target.value))} />
        </label>
      </div>
    </div>
  );
}

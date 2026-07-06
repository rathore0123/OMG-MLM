import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import "./Cropper.scss";

/* ─────────────────────────────────────────
   Canvas helper: pixels → base64
───────────────────────────────────────── */
const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute("crossOrigin", "anonymous");
    image.src = imageSrc;

    image.onload = () => {
      const canvas  = document.createElement("canvas");
      canvas.width  = pixelCrop.width;
      canvas.height = pixelCrop.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) { reject("No canvas context"); return; }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => reject("Image load failed");
  });

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface CropperModalProps {
  open       : boolean;
  image      : string;
  onCrop     : (dataUrl: string) => void;
  onClose    : () => void;
  aspectRatio?: number;
}

const RATIOS = [
  { label: "1:1",  value: 1 },
  { label: "4:3",  value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "3:4",  value: 3 / 4 },
  { label: "9:16", value: 9 / 16 },
];

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
const CropperModal: React.FC<CropperModalProps> = ({
  open,
  image,
  onCrop,
  onClose,
  aspectRatio = 1,
}) => {
  const [crop,            setCrop          ] = useState<Point>({ x: 0, y: 0 });
  const [zoom,            setZoom          ] = useState(1);
  const [rotation,        setRotation      ] = useState(0);
  const [activeRatio,     setActiveRatio   ] = useState(aspectRatio);
  const [croppedAreaPx,   setCroppedAreaPx ] = useState<Area | null>(null);
  const [saving,          setSaving        ] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPx(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPx) return;
    try {
      setSaving(true);
      const result = await getCroppedImg(image, croppedAreaPx);
      onCrop(result);
      onClose();
    } catch (e) {
      console.error("Crop failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // reset state on close
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setActiveRatio(aspectRatio);
    onClose();
  };

  if (!open || !image) return null;

  return (
    <div className="cm-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="cm-dialog">

        {/* ── HEADER ── */}
        <div className="cm-header">
          <h3 className="cm-title">Edit Profile Photo</h3>
          <button type="button" className="cm-close" onClick={handleClose}>✕</button>
        </div>

        {/* ── BODY ── */}
        <div className="cm-body">

          {/* Crop canvas */}
          <div className="cm-canvas">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={activeRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={true}
              style={{
                containerStyle: { borderRadius: "10px" },
              }}
            />
          </div>

          {/* Tools */}
          <div className="cm-tools">

            {/* Zoom */}
            <div className="cm-tool-group">
              <label className="cm-tool-label">Zoom  <span className="cm-tool-val">{zoom.toFixed(1)}×</span></label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="cm-range"
              />
            </div>

            {/* Rotation */}
            <div className="cm-tool-group">
              <label className="cm-tool-label">Rotation  <span className="cm-tool-val">{rotation}°</span></label>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="cm-range"
              />
              <div className="cm-btn-row">
                <button type="button" className="cm-tool-btn" onClick={() => setRotation((r) => r - 90)}>⟲ −90°</button>
                <button type="button" className="cm-tool-btn" onClick={() => setRotation(0)}>Reset</button>
                <button type="button" className="cm-tool-btn" onClick={() => setRotation((r) => r + 90)}>⟳ +90°</button>
              </div>
            </div>

            {/* Aspect ratio */}
            <div className="cm-tool-group">
              <label className="cm-tool-label">Aspect Ratio</label>
              <div className="cm-ratio-grid">
                {RATIOS.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setActiveRatio(r.value)}
                    className={`cm-ratio-btn${activeRatio === r.value ? " active" : ""}`}
                  >
                    {r.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setActiveRatio(0)}     // 0 = free (react-easy-crop ignores aspect when 0/undefined)
                  className={`cm-ratio-btn free${activeRatio === 0 ? " active" : ""}`}
                >
                  Free
                </button>
              </div>
            </div>

            {/* Reset all */}
            <div className="cm-tool-group">
              <button
                type="button"
                className="cm-tool-btn cm-tool-btn--full"
                onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); setRotation(0); setActiveRatio(aspectRatio); }}
              >
                ↺ Reset All
              </button>
            </div>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="cm-footer">
          <button type="button" className="cm-btn-cancel" onClick={handleClose}>Cancel</button>
          <button type="button" className="cm-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Crop & Save"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CropperModal;

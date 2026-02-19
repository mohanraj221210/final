import React, { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
        rotation = 0
    ): Promise<Blob | null> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        // set each dimensions to double largest dimension to allow for a safe area for the
        // image to rotate in without being clipped by canvas context
        canvas.width = safeArea;
        canvas.height = safeArea;

        // translate canvas context to a central location on image to allow rotating around the center.
        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        // draw rotated image and store data.
        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        // set canvas width to final desired crop size - this will clear existing context
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // paste generated rotate image with correct offsets for x,y crop values.
        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        );

        // As Base64 string
        // return canvas.toDataURL('image/jpeg');

        // As Blob
        return new Promise((resolve, reject) => {
            canvas.toBlob((file) => {
                if (file) resolve(file);
                else reject(null);
            }, 'image/jpeg');
        });
    };

    const handleCrop = async () => {
        if (croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
                if (croppedImage) {
                    onCropComplete(croppedImage);
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="cropper-modal">
            <div className="cropper-container">
                <div className="crop-area">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>
                <div className="controls">
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="zoom-range"
                    />
                    <div className="button-group">
                        <button onClick={onCancel} className="btn-cancel">Cancel</button>
                        <button onClick={handleCrop} className="btn-save">Crop & Save</button>
                    </div>
                </div>
            </div>
            <style>{`
                .cropper-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 2000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .cropper-container {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                }
                .crop-area {
                    position: relative;
                    flex: 1;
                    background: #333;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-bottom: 20px;
                }
                .controls {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .zoom-range {
                    width: 100%;
                    cursor: pointer;
                }
                .button-group {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                .btn-cancel {
                    padding: 8px 16px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .btn-save {
                    padding: 8px 16px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default ImageCropper;

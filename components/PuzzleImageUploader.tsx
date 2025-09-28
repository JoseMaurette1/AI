"use client"
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FileUpload, { DropZone, FileError } from '@/components/ui/file-upload';
import { Image as ImageIcon, RotateCcw } from 'lucide-react';
// Revert to using native img for dynamic blob URLs

interface PuzzleImageUploaderProps {
  onImageSelect: (imageUrl: string, tiles: string[]) => void;
  currentImage?: string;
}

const PuzzleImageUploader: React.FC<PuzzleImageUploaderProps> = ({ 
  onImageSelect, 
  currentImage 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');

  const sliceImageIntoTiles = useCallback((image: HTMLImageElement): Promise<string[]> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Determine the square size based on the smaller dimension
      const size = Math.min(image.width, image.height);
      canvas.width = size;
      canvas.height = size;
      
      // Draw the image centered and cropped to square
      const offsetX = (image.width - size) / 2;
      const offsetY = (image.height - size) / 2;
      ctx.drawImage(image, offsetX, offsetY, size, size, 0, 0, size, size);
      
      // Create tiles
      const tileSize = size / 3;
      const tiles: string[] = [];
      
      // Extract 9 tiles (including the blank position)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (row === 2 && col === 2) {
            // Last tile is the blank space
            tiles.push('');
          } else {
            const tileCanvas = document.createElement('canvas');
            const tileCtx = tileCanvas.getContext('2d')!;
            tileCanvas.width = tileSize;
            tileCanvas.height = tileSize;
            
            // Extract the tile from the main canvas
            tileCtx.drawImage(
              canvas,
              col * tileSize, row * tileSize, tileSize, tileSize,
              0, 0, tileSize, tileSize
            );
            
            tiles.push(tileCanvas.toDataURL());
          }
        }
      }
      
      resolve(tiles);
    });
  }, []);

  const handleFileSelect = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;

    setIsProcessing(true);
    
    try {
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
      
      // Load the image to slice it
      const img = new window.Image();
      img.onload = async () => {
        try {
          const tiles = await sliceImageIntoTiles(img);
          onImageSelect(imageUrl, tiles);
        } catch (error) {
          console.error('Error slicing image:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
    }
  }, [onImageSelect, sliceImageIntoTiles]);

  const handleReset = useCallback(() => {
    setPreviewUrl('');
    onImageSelect('', []);
  }, [onImageSelect]);

  // Sample images for quick testing
  const handleSampleImage = useCallback(async (sampleUrl: string) => {
    setIsProcessing(true);
    
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const tiles = await sliceImageIntoTiles(img);
          setPreviewUrl(sampleUrl);
          onImageSelect(sampleUrl, tiles);
        } catch (error) {
          console.error('Error processing sample image:', error);
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = sampleUrl;
    } catch (error) {
      console.error('Error loading sample image:', error);
      setIsProcessing(false);
    }
  }, [onImageSelect, sliceImageIntoTiles]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Puzzle Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Image Preview */}
        {previewUrl && (
          <div className="space-y-4">
            <img 
              src={previewUrl}
              alt="Puzzle image"
              className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
              draggable={false}
            />
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleReset}
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Change Image
              </Button>
            </div>
          </div>
        )}

        {/* File Upload */}
        <FileUpload
          multiple={false}
          accept="image/*"
          maxCount={1}
          maxSize={10}
          onFileSelect={handleFileSelect}
          disabled={isProcessing}
        >
          <FileError />
          <DropZone 
            prompt={previewUrl ? "Drop a new image here or click to browse" : "Drop an image here or click to browse"}
            className="min-h-[150px]"
          />
        </FileUpload>

        {/* Sample Images */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Or try a sample image:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleSampleImage('https://picsum.photos/300/300?random=1')}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              Nature
            </Button>
            <Button
              onClick={() => handleSampleImage('https://picsum.photos/300/300?random=2')}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              Architecture
            </Button>
            <Button
              onClick={() => handleSampleImage('https://picsum.photos/300/300?random=3')}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              Abstract
            </Button>
          </div>
        </div>

        {isProcessing && (
          <div className="text-center text-sm text-gray-500">
            Processing image...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PuzzleImageUploader;

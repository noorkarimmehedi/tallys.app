import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  onMaxRatingChange?: (value: number) => void;
  preview?: boolean;
}

export default function Rating({ 
  value, 
  onChange, 
  maxRating = 5, 
  onMaxRatingChange,
  preview = false 
}: RatingProps) {
  const handleStarClick = (rating: number) => {
    onChange(rating);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">Rating</Label>
        
        <div className="flex justify-center my-4">
          {Array.from({ length: maxRating }).map((_, index) => {
            const rating = index + 1;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleStarClick(rating)}
                className={`text-3xl px-1 focus:outline-none ${
                  rating <= value ? "text-yellow-400" : "text-gray-300"
                }`}
                disabled={preview}
              >
                <i className="ri-star-fill"></i>
              </button>
            );
          })}
        </div>
        
        {!preview && onMaxRatingChange && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <Label className="block text-sm font-medium text-gray-700 mb-2">Maximum rating</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[maxRating]}
                min={1}
                max={10}
                step={1}
                onValueChange={(values) => onMaxRatingChange(values[0])}
                className="flex-1"
              />
              <Input
                type="number"
                min={1}
                max={10}
                value={maxRating}
                onChange={(e) => onMaxRatingChange(Number(e.target.value))}
                className="w-16"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

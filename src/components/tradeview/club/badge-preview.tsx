
"use client"

import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgePreviewProps {
    icon: string;
    iconContent: string;
    bgColor: string;
    borderColor: string;
    size?: number;
    className?: string;
}

const borderColors: Record<string, string> = {
    default: '#4b5563',
    gold: '#ffd700',
    silver: '#c0c0c0',
    bronze: '#cd7f32',
};


export default function BadgePreview({
    icon,
    iconContent,
    bgColor,
    borderColor,
    size = 24,
    className
}: BadgePreviewProps) {

    const finalBorderColor = borderColors[borderColor] || borderColors['default'];

    return (
        <div className={cn("relative", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 100 100" className="absolute top-0 left-0">
                <defs>
                    <clipPath id="coinClip">
                        <circle cx="50" cy="50" r="50" />
                    </clipPath>
                </defs>
                
                <g clipPath="url(#coinClip)">
                    <rect width="100" height="100" fill={bgColor} />
                </g>

                <circle 
                    cx="50" cy="50" r="46"
                    fill="none" 
                    stroke={finalBorderColor} 
                    strokeWidth="8"
                />

                <text 
                    x="50%" 
                    y="50%" 
                    dominantBaseline="middle" 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="60" 
                    fontWeight="bold"
                    dy=".05em"
                >
                    {iconContent}
                </text>
            </svg>
        </div>
    );
}

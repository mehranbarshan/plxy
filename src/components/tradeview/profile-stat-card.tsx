import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ProfileStatCardProps = {
    icon: ReactNode;
    title: string;
    value: string;
    valueColor?: string;
    change?: string;
    changeType?: 'positive' | 'negative';
    subtitle?: string;
}

export default function ProfileStatCard({ icon, title, value, valueColor, change, changeType, subtitle }: ProfileStatCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm text-center flex flex-col justify-center p-4">
        <div className="flex justify-center mb-2 text-primary">
            {icon}
        </div>
        <p className={cn("text-lg font-bold", valueColor)}>{value}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
    </Card>
  )
}

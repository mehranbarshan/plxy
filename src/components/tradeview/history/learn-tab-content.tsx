
"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle, Trophy } from "lucide-react";

export default function LearnTabContent() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-2xl p-4 flex flex-col items-center text-center gap-1 shadow-sm">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <p className="text-xl font-bold">8</p>
                    <p className="text-xs text-muted-foreground">Lessons Completed</p>
                </Card>
                <Card className="rounded-2xl p-4 flex flex-col items-center text-center gap-1 shadow-sm">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <p className="text-xl font-bold">2</p>
                    <p className="text-xs text-muted-foreground">Certificates Earned</p>
                </Card>
            </div>

            <Card className="rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-base font-bold">News Analysis Mastery</CardTitle>
                            <Badge variant="outline" className="my-2 text-xs">Available</Badge>
                        </div>
                        <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 text-xs h-8">Start</Button>
                    </div>
                    <CardDescription className="text-xs mt-1">Learn to read and interpret crypto news for trading decisions</CardDescription>
                    <div className="text-xs text-muted-foreground mt-3">
                        <span>8 lessons</span> &bull; <span>2 hours</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-base font-bold">Market Sentiment Analysis</CardTitle>
                            <Badge variant="secondary" className="my-2 text-xs">In Progress</Badge>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs h-8">Continue</Button>
                    </div>
                    <CardDescription className="text-xs mt-1">Understand how market emotions drive price movements</CardDescription>
                    <div className="text-xs text-muted-foreground mt-3">
                        <span>6 lessons</span> &bull; <span>1.5 hours</span>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">25%</span>
                        </div>
                        <Progress value={25} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-base font-bold">Risk Management Fundamentals</CardTitle>
                            <Badge variant="secondary" className="my-2 text-xs">In Progress</Badge>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs h-8">Continue</Button>
                    </div>
                    <CardDescription className="text-xs mt-1">Master position sizing and risk control techniques</CardDescription>
                    <div className="text-xs text-muted-foreground mt-3">
                        <span>10 lessons</span> &bull; <span>3 hours</span>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-base font-bold">Advanced Technical Patterns</CardTitle>
                            <Badge variant="outline" className="my-2 text-xs">Locked</Badge>
                        </div>
                        <Button size="sm" disabled className="text-xs h-8">Locked</Button>
                    </div>
                    <CardDescription className="text-xs mt-1">Identify complex chart patterns for better entries</CardDescription>
                    <div className="text-xs text-muted-foreground mt-3">
                        <span>12 lessons</span> &bull; <span>4 hours</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl bg-green-100/60 dark:bg-green-900/30 border-green-200/80 dark:border-green-800/50">
                <CardContent className="p-6 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-green-800 dark:text-green-300">Unlock Premium Learning</h3>
                    <p className="text-sm text-green-700/80 dark:text-green-400/80 mt-1 mb-4">Access advanced courses and restore $5,000 demo balance</p>
                    <Button className="bg-white text-foreground hover:bg-gray-100 shadow-sm border text-sm h-10">Upgrade to Premium</Button>
                </CardContent>
            </Card>
        </div>
    )
}

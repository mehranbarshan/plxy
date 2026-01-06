
'use server';

interface ClosedSignal {
    ticker: string;
    pnl: number;
    roe: number;
    tradeType: 'Long' | 'Short';
    closeTimestamp: string;
}

export async function getTradeHistorySummary(tradeHistoryJson: string): Promise<string> {
    try {
        const trades: ClosedSignal[] = JSON.parse(tradeHistoryJson);

        if (trades.length === 0) {
            return "The user has no trade history to analyze.";
        }

        const totalTrades = trades.length;
        const wins = trades.filter(t => t.pnl >= 0);
        const losses = trades.filter(t => t.pnl < 0);
        const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
        
        const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

        const biggestWin = wins.reduce((max, t) => t.pnl > max.pnl ? t : max, { pnl: -Infinity, ticker: '' });
        const biggestLoss = losses.reduce((min, t) => t.pnl < min.pnl ? t : min, { pnl: Infinity, ticker: '' });

        let summary = `Here's an analysis of your last ${totalTrades} trades:\n\n`;
        summary += `*   **Win Rate:** ${winRate.toFixed(1)}% (${wins.length} wins, ${losses.length} losses)\n`;
        summary += `*   **Total P&L:** $${totalPnl.toFixed(2)}\n`;

        if (biggestWin.ticker) {
            summary += `*   **Biggest Win:** +$${biggestWin.pnl.toFixed(2)} on a ${biggestWin.ticker.replace('USDT','')} trade.\n`;
        }
        if (biggestLoss.ticker) {
            summary += `*   **Biggest Loss:** $${biggestLoss.pnl.toFixed(2)} on a ${biggestLoss.ticker.replace('USDT','')} trade.\n`;
        }

        const mostTraded = trades.reduce((acc, t) => {
            acc[t.ticker] = (acc[t.ticker] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostTradedAsset = Object.keys(mostTraded).reduce((a, b) => mostTraded[a] > mostTraded[b] ? a : b, '');

        if(mostTradedAsset) {
            summary += `*   **Most Traded Asset:** ${mostTradedAsset.replace('USDT','')}\n`;
        }

        summary += "\nIs there anything specific you'd like to improve or analyze further?";

        return summary;
    } catch (error) {
        console.error("Error analyzing trade history:", error);
        return "I'm sorry, I had trouble analyzing the provided trade history. The data might be in an unexpected format.";
    }
}

// src/components/tradeview/tradingview-widget.tsx
"use client"
import React, { useEffect, useRef, memo, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Maximize, Minimize } from 'lucide-react';

// Define a basic interface for the TradingView widget object
interface TradingViewWidget {
  new (options: any): any;
  widget: new (options: any) => any;
}

// Extend the global Window interface to include the optional TradingView object
interface Window {
  TradingView?: TradingViewWidget;
}


function TradingViewWidget({ symbol, interval = "D" }: { symbol: string, interval?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetContainer = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [handleFullscreenChange]);

  useEffect(
    () => {
      if (!widgetContainer.current) return;
      
      // Clear the container before appending the new script
      widgetContainer.current.innerHTML = '';

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (typeof (window as any).TradingView !== 'undefined' && widgetContainer.current) {
          new (window as any).TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: interval,
            timezone: "Etc/UTC",
            theme: "light",
            style: "1",
            locale: "en",
            enable_publishing: false,
            allow_symbol_change: true,
            containerid: widgetContainer.current.id,
          });
        }
      };

      // Set a unique ID for the container to avoid conflicts
      widgetContainer.current.id = `tradingview_widget_${Math.random().toString(36).substr(2, 9)}`;
      widgetContainer.current.appendChild(script);

    },
    [symbol, interval]
  );
  
  const handleFullscreenToggle = () => {
    if (!container.current) return;

    if (!document.fullscreenElement) {
        container.current.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  return (
    <div className="tradingview-widget-container relative" ref={container} style={{ height: "100%", width: "100%" }}>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 text-muted-foreground w-8 h-8" onClick={handleFullscreenToggle}>
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </Button>
      <div ref={widgetContainer} style={{ height: "100%", width: "100%" }}>
         <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
          <div className="tradingview-widget-copyright" style={{display: 'none'}}>
            <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
                <span className="blue-text">Track all markets on TradingView</span>
            </a>
          </div>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);

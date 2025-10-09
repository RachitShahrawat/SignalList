'use client';

import React, { useState, useTransition } from 'react';
import WatchlistButton from '@/components/WatchlistButton';
import { toggleWatchlistStock } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';

type StockPageActionsProps = {
    symbol: string;
    company: string;
    initialIsWatched: boolean;
};

export default function StockPageActions({ symbol, company, initialIsWatched }: StockPageActionsProps) {
    const [isWatched, setIsWatched] = useState(initialIsWatched);
    const [isPending, startTransition] = useTransition();

    const handleToggleWatchlist = () => {
        startTransition(async () => {
            const result = await toggleWatchlistStock(symbol, company, isWatched);

            if (result.success) {
                const newWatchedState = !isWatched;
                setIsWatched(newWatchedState);
                toast.success(newWatchedState ? `${symbol} added to watchlist` : `${symbol} removed from watchlist`);
            } else {
                toast.error(`Error: ${result.error}`);
            }
        });
    };

    return (
        <div className="flex items-center justify-between">
            <WatchlistButton
                symbol={symbol}
                company={company}
                isInWatchlist={isWatched}
                onWatchlistChange={handleToggleWatchlist} // This connects the button click to our action
            />
        </div>
    );
}
import React from 'react';
import { getWatchlistItems } from '@/lib/actions/watchlist.actions';
import { getStockQuote } from '@/lib/actions/finnhub.actions';
import { formatPrice, getChangeColorClass, formatChangePercent } from '@/lib/utils';
import WatchlistTable from '@/components/WatchlistTable';
import Link from 'next/link';

const WatchlistPage = async () => {
    const watchlistFromDb = await getWatchlistItems();

    if (watchlistFromDb.length === 0) {
        return (
            <section className="text-center">
                <h1 className="text-3xl font-bold text-white mb-4">My Watchlist</h1>
                <p className="text-gray-400 mb-6">Your watchlist is empty.</p>
                <Link href="/" className="bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                    Find Stocks to Watch
                </Link>
            </section>
        );
    }

    // Fetch live data for all stocks in parallel
    const stocksWithData = await Promise.all(
        watchlistFromDb.map(async (item) => {
            const quote = await getStockQuote(item.symbol);
            const changePercent = quote?.dp ?? 0;
            const changeColor = getChangeColorClass(changePercent);

            return {
                ...item,
                currentPrice: quote?.c ?? 0,
                changePercent: changePercent,
                priceFormatted: formatPrice(quote?.c ?? 0),
                changeFormatted: formatChangePercent(changePercent),
                changeColorClass: changeColor,
            };
        })
    );

    return (
        <section>
            <h1 className="text-3xl font-bold text-white mb-8">My Watchlist</h1>
            <WatchlistTable initialWatchlist={stocksWithData} />
        </section>
    );
};

export default WatchlistPage;
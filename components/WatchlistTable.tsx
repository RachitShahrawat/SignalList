'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { toggleWatchlistStock } from '@/lib/actions/watchlist.actions';
// import { formatPrice, getChangeColorClass, formatChangePercent } from '@/lib/utils';
import WatchlistButton from '@/components/WatchlistButton';
import Link from 'next/link';

type WatchlistTableProps = {
    initialWatchlist: StockWithData[];
};

export default function WatchlistTable({ initialWatchlist }: WatchlistTableProps) {
    const [watchlist, setWatchlist] = useState(initialWatchlist);
    const [isPending, startTransition] = useTransition();

    const handleRemove = (symbol: string) => {
        startTransition(async () => {
            const result = await toggleWatchlistStock(symbol, '', true); // company name not needed for removal

            if (result.success) {
                // Optimistically remove from UI
                setWatchlist((current) => current.filter((stock) => stock.symbol !== symbol));
                toast.success(`${symbol} removed from your watchlist.`);
            } else {
                toast.error(`Failed to remove ${symbol}: ${result.error}`);
            }
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        {['Company', 'Symbol', 'Price', 'Change', 'Action'].map((header) => (
                            <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {watchlist.map((stock) => (
                        <tr key={stock.symbol} className="hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Link href={`/stocks/${stock.symbol}`} className="text-sm font-medium text-white hover:text-yellow-400">
                                    {stock.company}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{stock.symbol}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{stock.priceFormatted}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${stock.changeColorClass}`}>
                                {stock.changeFormatted}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <WatchlistButton
                                    symbol={stock.symbol}
                                    company={stock.company}
                                    isInWatchlist={true} // Always true on this page
                                    showTrashIcon={true}
                                    onWatchlistChange={() => handleRemove(stock.symbol)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
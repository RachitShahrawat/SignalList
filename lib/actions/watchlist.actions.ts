'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist, type WatchlistItem } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers'; // <-- THIS IS THE FIX
import { revalidatePath } from 'next/cache';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}

// ADD THIS NEW FUNCTION
export async function isStockInWatchlist(symbol: string): Promise<boolean> {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;

        if (!userId) return false;

        const count = await Watchlist.countDocuments({ userId, symbol });
        return count > 0;
    } catch (err) {
        console.error('isStockInWatchlist error:', err);
        return false;
    }
}

export async function getWatchlistItems(): Promise<WatchlistItem[]> {
    console.log('--- GET WATCHLIST ITEMS ACTION TRIGGERED ---');
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;

        console.log('User ID from session:', userId); // Log the User ID

        if (!userId) {
            console.log('No user ID found, returning empty list.');
            return [];
        }

        console.log(`Searching for watchlist items for user: ${userId}`);
        const items = await Watchlist.find({ userId }).lean();
        console.log(`ITEMS FOUND in DB:`, items); // Log what was found

        return JSON.parse(JSON.stringify(items));
    } catch (err) {
        console.error('ERROR in getWatchlistItems:', err);
        return [];
    }
}

export async function toggleWatchlistStock(symbol: string, company: string, isInWatchlist: boolean) {
    console.log('--- TOGGLE WATCHLIST ACTION TRIGGERED ---');
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id;

        console.log('User ID from session:', userId); // Log the User ID
        console.log('Stock Symbol:', symbol);
        console.log('Is it already in watchlist?', isInWatchlist);

        if (!userId) {
            throw new Error('You must be logged in to modify the watchlist.');
        }

        if (isInWatchlist) {
            console.log('ATTEMPTING TO REMOVE stock from DB...');
            await Watchlist.deleteOne({ userId, symbol });
            console.log('SUCCESS: Stock removed.');
        } else {
            console.log('ATTEMPTING TO ADD stock to DB...');
            await Watchlist.create({ userId, symbol, company });
            console.log('SUCCESS: Stock added.');
        }
        
        revalidatePath('/watchlist');
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        console.error('ERROR in toggleWatchlistStock:', message); // Log any errors
        return { success: false, error: message };
    }
}



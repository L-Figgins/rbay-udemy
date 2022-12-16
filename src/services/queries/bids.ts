import type { CreateBidAttrs,} from '$services/types';
import { client} from "$services/redis";
import { DateTime } from 'luxon';
import { parse } from 'dotenv';
import { bidHistoryKey } from '$services/keys';


export const createBid = async (attrs: CreateBidAttrs) => {
	const serialized = serializeHistory(attrs.amount,attrs.createdAt.toMillis())

	return client.rPush(bidHistoryKey(attrs.itemId, seril))
}

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	return [];
};


const serializeHistory = (amount:number, createdAt:number)=> {
	return `${amount}:${createdAt}`
}

const deserializeHistory = (stored:string) => {
	const [amount, createdAt] = stored.split(':');

	return {
		amount: parseFloat(amount),
		createdAt: DateTime.fromMillis(parseInt(createdAt))
	}
}
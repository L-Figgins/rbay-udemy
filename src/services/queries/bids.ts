import type { CreateBidAttrs, Bid} from '$services/types';
import { client} from "$services/redis";
import { DateTime } from 'luxon';
import { parse } from 'dotenv';
import { bidHistoryKey } from '$services/keys';


export const createBid = async (attrs: CreateBidAttrs) => {
	const serialized = serializeHistory(attrs.amount,attrs.createdAt.toMillis())

	return client.rPush(bidHistoryKey(attrs.itemId), serialized)
}

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	// convert offest to an index to be consumed by redis LRANGE cmd
	const endIndex = -1 - offset
	const startIndex = -1 * offset - count
	const range = await client.lRange(bidHistoryKey(itemId), startIndex, endIndex)
	return range.map(bid => deserializeHistory(bid));
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
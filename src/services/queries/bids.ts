import type { CreateBidAttrs, Bid} from '$services/types';
import { client, withLock} from "$services/redis";
import { DateTime } from 'luxon';
import { bidHistoryKey, itemsKey, itemsByPriceKey } from '$services/keys';
import { getItem, } from './items';


export const createBid = async (attrs: CreateBidAttrs) => {
	// validations
	// simple lock. Use redlock algo in real projects
	// https://redis.io/docs/manual/patterns/distributed-locks/
	return withLock(attrs.itemId, async () => {
		await client.watch(itemsKey(attrs.itemId))
		const item = await getItem(attrs.itemId);

		if (!item){
			throw new Error('item does not exist');
		}

		if (item.price >= attrs.amount) {
			throw new Error('Bid too low');
		}

		if (item.endingAt.diff(DateTime.now()).toMillis() < 0 ) {
			throw new Error('Item is closed to bidding');
		}

		const serialized = serializeHistory(attrs.amount,attrs.createdAt.toMillis())
		// this is probably different between client implementations
		return Promise.all([
			client.rPush(bidHistoryKey(attrs.itemId), serialized),
			client.hSet(itemsKey(item.id), {
				bids: item.bids + 1,
				price: attrs.amount	,// watch item for updates. If updated will cancel transaction
		
				highestBidUserId: attrs.userId
			}),
			client.zAdd(itemsByPriceKey(), {value: attrs.itemId, score: attrs.amount})
		])
	})

	// example of a transaction using watch. This is not appropriate to solve the concurrency issue here and is left as an example
	// as this is an exploratory project

	// return client.executeIsolated( async (isolatedClient)=> {
	// 	await isolatedClient.watch(itemsKey(attrs.itemId))
	// 	const item = await getItem(attrs.itemId);

	// 	if (!item){
	// 		throw new Error('item does not exist');
	// 	}

	// 	if (item.price >= attrs.amount) {
	// 		throw new Error('Bid too low');
	// 	}

	// 	if (item.endingAt.diff(DateTime.now()).toMillis() < 0 ) {
	// 		throw new Error('Item is closed to bidding');
	// 	}

	// 	const serialized = serializeHistory(attrs.amount,attrs.createdAt.toMillis())
	// 	// this is probably different between client implementations
	// 	return isolatedClient
	// 		.multi()
	// 		.rPush(bidHistoryKey(attrs.itemId), serialized)
	// 		.hSet(itemsKey(item.id), {
	// 			bids: item.bids + 1,
	// 			price: attrs.amount	,// watch item for updates. If updated will cancel transaction
		
	// 			highestBidUserId: attrs.userId
	// 		})
	// 		.zAdd(itemsByPriceKey(), {value: attrs.itemId, score: attrs.amount})
	// 		.exec();
	// })
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
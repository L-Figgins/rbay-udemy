import { itemsByEndingAtKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";
import { getItems } from "./items";

/**
 * @obj[f*/
export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0,
	count = 10
) => {
	
	const now = Date.now();
	const ids = await client.zRange(itemsByEndingAtKey(), now, "+inf", {
		BY: 'SCORE',
		LIMIT: {
			offset,
			count
		}	
	})
	const results = await Promise.all(ids.map( (id)=>{
		return client.hGetAll(itemsKey(id))
	}))

	return results.map((item, i) => {
		return deserialize(ids[i], item)
	})
};

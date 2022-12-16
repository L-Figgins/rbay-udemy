import { itemsByViewsKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    return Promise.all([
        client.hIncrBy(itemsKey(itemId),'views', 1),
        // score is the first arguement in zsets swapped from above
        client.zIncrBy(itemsByViewsKey(),1,itemId)
    ])
};

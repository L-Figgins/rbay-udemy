import { client } from "$services/redis";

export const incrementView = async (itemId: string, userId: string) => {
    //hyperlog

    //before lua script optimization
    // const inserted = await client.pfAdd(itemsViewsKey(itemId), userId);

    // if(inserted){
    //     return Promise.all([
    //         client.hIncrBy(itemsKey(itemId),'views', 1),
    //         // score is the first arguement in zsets swapped from above
    //         client.zIncrBy(itemsByViewsKey(),1,itemId)
    //     ])
    // }

    // keys needed for script
    // 1) itemsViewsKey
    // 2) itemsKey
    // 3) itemsByViewsKey

    // args
    // itemId
    // userId

    return client.incrementView(itemId, userId)
};

import { itemsByViewsKey, itemsKey } from "$services/keys";
import { client } from "$services/redis";
import { deserialize } from "./deserialize";

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
    let results:any = await client.sort(itemsByViewsKey(),
    {
        GET:[
            '#',
            `${itemsKey('*')}->name`,
            `${itemsKey('*')}->views`,
            `${itemsKey('*')}->endingAt`,
            `${itemsKey('*')}->imageUrl`,
            `${itemsKey('*')}->price`,

        ],
        BY: 'nosort',
        DIRECTION: order,
        LIMIT:{offset, count}
    })

    const items = collectItems(results)

    return items

    
};

function collectItems(data:any[]){
    //this method mutates data
    const items = []
    while(data.length){
        const [id, name, views, endingAt, imageUrl, price, ...rest] = data;
        const item = deserialize(id, {name,views, endingAt, imageUrl, price})
        items.push(item);
        data = rest;
    }
    return items
}

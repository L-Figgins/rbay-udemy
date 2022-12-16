import { client } from '$services/redis';
import type { CreateItemAttrs } from '$services/types';
import { genId } from '$services/utils';
import { serialize } from '$services/queries/items/serialize';
import { itemsKey, itemsByViewsKey, itemsByEndingAtKey } from '../../keys';
import { isEmptyObj } from '$services/utils/is-empty-obj';
import { deserialize } from '$services/queries/items/deserialize';

export const getItem = async (id: string) => {
    const item = await client.hGetAll(itemsKey(id));

    if(isEmptyObj(item)){
        return null;
    }

    return deserialize(id, item )
};

export const getItems = async (ids: string[]) => {
    const commands = ids.map((id) => {
        return client.hGetAll((itemsKey(id)));
    })

    const results = await Promise.all(commands);

    const items = results.map( (result, index) => {
        if((isEmptyObj(result))){
            return null
        }

        return deserialize(ids[index], result) 
    })

    return items;
};

export const createItem = async (attrs: CreateItemAttrs, userId:string) => {
    const id = genId();
    const serialized = serialize(attrs, userId);

    //instead pipeline (pipe in other langauges)
    // in javascript you wrap in a promise.all and node-redis handles internally
    await Promise.all([
        client.hSet(itemsKey(id), serialized),
        client.zAdd(itemsByViewsKey(),{
           value: id,
           score: 0 // #items start with zero views
       }),
       client.zAdd(itemsByEndingAtKey(), {
        value:id,
        score: attrs.endingAt.toMillis()
       })
    ])
       
   
    return id
};

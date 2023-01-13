import { itemsIndexKey,itemsKey } from "$services/keys";
import { client } from "./client";
import { SchemaFieldTypes,} from "redis";


//creates an index for use with redisearch module
export const createIndexes = async () => {

    const indexes = await client.ft._list();

    const exists =indexes.find(index => index === itemsIndexKey());

    if(exists) return;
    
    return client.ft.create(
        itemsIndexKey(),
        {
            name:{
                type: SchemaFieldTypes.TEXT
            },
            description: {
                type: SchemaFieldTypes.TEXT
            }
        },
        {
            ON:'HASH',
            PREFIX: itemsKey('')
        }
    )
};

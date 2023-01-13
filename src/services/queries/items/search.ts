import {client} from "$services/redis";
import { deserialize } from "./deserialize";
import { itemsIndexKey } from "$services/keys";

export const searchItems = async (term: string, size: number = 5) => {
    //find all non-alphanumeric characters and replace with an empty string
    const cleaned = term.replaceAll(/[^a-zA-Z0-9]/g, '').trim().split(' ').map((word)=> word ? `%${word}%` : '').join(' ')

    // Look at cleaned and make sure it is valid

    // use the client to do an actual search

    // deserialize and return the search results


    if(cleaned === '') {
        return [];
    }

    const results = await client.ft.search(
        itemsIndexKey(),
        //since we searching against all fields we don't need @field syntax
        cleaned, 
        {
            LIMIT: {
                from: 0,
                size,
            }
        }
    )

    //deserialize and return the search results

    return results.documents.map( ({id, value}) => deserialize(id, value as any))

}; 

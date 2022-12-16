import type { Item } from '$services/types';
import { DateTime } from 'luxon';

export const deserialize = (id: string, item: { [key: string]: string }): Item => {
    const {name, description, imageUrl, highestBidUserId, ownerId, createdAt,endingAt, likes, bids, views, price} = item;
    return {
        id,
        name,
        description,
        imageUrl,
        highestBidUserId,
        ownerId,
        createdAt: DateTime.fromMillis(parseInt(createdAt)),
        endingAt: DateTime.fromMillis(parseInt(endingAt)),
        views: parseInt(views),
        likes: parseInt(likes),
        bids: parseInt(bids),
        price:  parseFloat(price)
    }
};

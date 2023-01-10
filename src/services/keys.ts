//caching
export const pageCacheKey = (id:string) => {
    return `pagecache#${id}`
}

export const sessionsKey = (sessionId:string) => {
    return `sessions#${sessionId}`;
}

//items
export const itemsKey = (itemId:string) => `items#${itemId}`
export const itemsViewsKey = (itemId:string) => `items:views#${itemId}`;
export const bidHistoryKey = (itemId:string) => `history#${itemId}`; 

//sorted sets
export const itemsByPriceKey = 'items:price'
export const itemsByViewsKey = () => 'items:views';
export const itemsByEndingAtKey = () => 'items:endingAt';

//users
export const usersKey = (userId:string) => `users#${userId}`
export const usernamesUniqueKey = () => 'usernames:unique';
export const usernamesKey = () => 'usernames';
export const userLikesKey = (userId:string) => `users:likes#${userId}`

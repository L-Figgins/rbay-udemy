import { createClient , defineScript} from 'redis';
import {itemsKey, itemsViewsKey, itemsByViewsKey} from "$services/keys";
import { readJsonConfigFile } from 'typescript';

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW,
	scripts: {
		addOneAndStore: defineScript({
				NUMBER_OF_KEYS: 1,
				SCRIPT: `
					return redis.call('SET', KEYS[1], 1 + tonumber(ARGV[1]))
					`,
				transformArguments(key:string, value:number) {
						// this functions transforms provided arguments into something
						// that can be consumed by evalsha 
						// in this case converting the number to a string
						return [key, value.toString()]
				},
					transformReply(reply:any){
						return reply
			}
		}),
		incrementView: defineScript({
			NUMBER_OF_KEYS: 3,
			SCRIPT: `
				local itemsViewsKey = KEYS[1]
				local itemsKey = KEYS[2]
				local itemsByViewsKey = KEYS[3]

				local itemId = ARGV[1]
				local userId = ARGV[2]

				local inserted = redis.call('PFADD', itemsViewsKey, userId)

				if inserted == 1 then
					redis.call('HINCRBY', itemsKey, 'views', 1)
					redis.call('ZINCRBY', itemsByViewsKey, 1, itemId)
				end
			`,
			transformArguments(itemId:string, userId:string){
				return [
					//keys
					itemsViewsKey(itemId),
					itemsKey(itemId),
					itemsByViewsKey(),
					//args
					itemId,
					userId
				]
			},
			transformReply(reply:any) {
				return reply
			},
		})
	}
});

client.on('error', (err) => console.error(err));
client.connect();

export { client };

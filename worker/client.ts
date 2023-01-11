import { createClient, defineScript } from 'redis';

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT ||  '6379')
	},
	password: process.env.REDIS_PW,
	//define custom lua scripts
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
		})
	}
});

client.on('error', (err) => console.log(err));

export { client };
export type Client = typeof client;

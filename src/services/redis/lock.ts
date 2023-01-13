import { client } from "$services/redis";
import { randomBytes} from "crypto";

export const withLock = async (key:string, cb:(redisClient:Client)=>any) => {
	// use redi-lock for real projects this is just an example of locking

	// rety defaults
	const retryDelayMs = 100;
	let retries = 20;
	const timeoutMs = retryDelayMs * retries;

	const token = randomBytes(6).toString('hex')
	const lockKey = `lock:${key}`

	while (retries > 0) {
		//acquire lock
		retries--;
		const acquired = await client.set(lockKey, token, {
			NX: true,
			PX: 2000
		})
		
		// if not is not acquired retry

		if(!acquired){
			await pause(retryDelayMs);
			continue
		}

		try {
			const signal = {expired:false};
			const proxiedClient = buildClientProxy(timeoutMs)
			const result = await cb(proxiedClient)
			return result
		} finally {
			await client.unlock(lockKey, token)
		}
		//unset lock
	}


	//generate a random value
};

type Client = typeof client;
const buildClientProxy = (timeoutMs:number) => {
	const startTime = Date.now();

	const handler = {
		get(target:Client, prop: keyof Client) {
			if(Date.now() >= startTime + timeoutMs){
				throw new Error('Lock has expired')
			}

			const value = target[prop];
			return typeof value === 'function' ? value.bind(target) : value;
		}
	}

	return new Proxy(client, handler) as Client
};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};

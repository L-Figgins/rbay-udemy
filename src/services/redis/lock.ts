import { client } from "$services/redis";
import { randomBytes} from "crypto";

export const withLock = async (key:string, cb:()=>any) => {
	// use redi-lock for real projects this is just an example of locking

	// rety defaults
	const retryDelayMs = 100;
	let retries = 20;

	const token = randomBytes(6).toString('hex')
	const lockKey = `lock:${key}`

	while (retries > 0) {
		//acquire lock
		retries--;
		const acquired = await client.set(lockKey, token, {
			NX: true
		})
		
		// if not is not acquired retry

		if(!acquired){
			await pause(retryDelayMs);
			continue
		}

		const result = await cb()
		//unset lock

		await client.del(lockKey)
		return result;
	}


	//generate a random value
};

const buildClientProxy = () => {};

const pause = (duration: number) => {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
};

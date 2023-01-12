import type { RequestHandler } from '@sveltejs/kit';
import {DateTime} from 'luxon'
import { createImageUrl } from '$services/utils/image-url';
import { createItem } from '$services/queries/items/items';

export const post: RequestHandler = async ({ request, locals }) => {
	const data = await request.json();
	const id = await createItem(
		{   
			name: data.name,
			description: data.description,
			highestBidUserId: '',
			imageUrl: createImageUrl(),
			price: 0,
			views: 0,
			likes: 0,
			bids: 0,
			status: 'active',
			ownerId: locals.session.userId,
			createdAt: DateTime.now(),
			endingAt: DateTime.now().plus({seconds:data.duration})
		}, 
		locals.session.userId
	);

	return {
		status: 200,
		body: {
			id
		}
	};
};

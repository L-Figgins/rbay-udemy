import { sessionsKey } from '$services/keys';
import { client } from '$services/redis';
import type { Session } from '$services/types';
import { isEmptyObj } from '$services/utils';

export const getSession = async (id: string) => {
    const session = await client.hGetAll(sessionsKey(id));

    if(isEmptyObj(session)){
        return null;
    }

    return deserialize(id,session)
};

export const saveSession = async (session: Session) => {
    return client.hSet(
        sessionsKey(session.id),
        serialize(session)
    )
};

const serialize = (session:Session) => {
    const {userId, username} = session
    return {
        userId,
        username
    }
};

const deserialize = (id:string, session:{[key:string]:string}) => {
    const {userId, username} = session;
    return {
        id,
        userId,
        username
    }
}
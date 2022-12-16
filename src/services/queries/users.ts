import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import {client} from '$services/redis';
import { usernamesUniqueKey, usersKey,usernamesKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
    // use the username argument to look up the persons user id with the
    // usernames sorted set

    const decimalId = await client.zScore(usernamesKey(), username)

    if(!decimalId){
        throw new Error("User does not exist");
    }

    const id = decimalId.toString(16);
    const user = await client.hGetAll(usersKey(id))

    return deserialize(id, user)

    // make sure we actually got an ID from the lookup
    // use the id to look up the user's hash

    // deseriaze and return the hash
};

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id));
    return deserialize(id, user)
};

export const createUser = async (attrs: CreateUserAttrs) => {
    const id = genId();
    
    // redis suprisingly returns an interger here and not a string so a simple exitence check in js will work
    const exists = await client.sIsMember(usernamesUniqueKey(), attrs.username) 

    if(exists) {
        //throwing an error in an async function does what you would expect
        throw new Error('Username is taken');
    }

    await client.hSet(usersKey(id), serialize(attrs))
    await client.sAdd(usernamesUniqueKey(), attrs.username)
    await client.zAdd(usernamesKey(), {
        value: attrs.username,
        score: parseInt(id, 16)
    })
    
    return id;
};


const serialize = (user: CreateUserAttrs) => {
    const {username, password} = user
    return {
        username,
        password
    }
}

const deserialize = (id:string, user: {[key:string]:string})=> {
    const {username, password } = user;
    return {
        id,
        username,
        password
    }
}

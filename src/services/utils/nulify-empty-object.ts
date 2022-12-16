export function nulifyEmptyObject(obj:{[key:string]:string}) {
    if(Object.keys(obj).length === 0) {
        return null
    }
    return obj
}
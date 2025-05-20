//@ts-ignore
export const typeDeepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;
type Params = Record<string, string | number>;

function replacePathParams(path: string, params: Params): string {
    return path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
        if (params[key] === undefined) {
            throw new Error(`Missing parameter: ${key}`);
        }
        return encodeURIComponent(String(params[key]));
    });
}

export function getApiPath(path: string, params: Params = {}): string {
    return replacePathParams(path, params);
}

export default {
    uploadModToCommunity: (communityId: string) =>
        replacePathParams("/api/communities/:communityId/uploads", { communityId }),
}
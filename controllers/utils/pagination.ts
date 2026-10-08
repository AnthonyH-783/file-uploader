export const splitPage = function(offset: number, folderCount: number, limit: number){
    const folderTake = Math.max(0, Math.min(limit, folderCount - offset));
    return {
        folderTake,
        fileSkip: Math.max(0, offset - folderCount),
        fileTake : limit - folderTake
    }
}
export interface verifyDone{
    (error: any, user?: Express.User | false, options?: {message: string}): void
}

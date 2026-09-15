export interface verifyDone{
    (error: any, user?: Express.User | false, options?: {message: string}): void
}

export interface authedRequest extends Request {
    user: Express.User
}
import { User } from "./user.model"

export interface Profile {
    user?: User
    id?:number
    phone?:string
    photo?:string
}

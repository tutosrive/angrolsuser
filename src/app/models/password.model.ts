import { User } from "./user.model"

export interface Password {
    user?: User // Si es así?
    id?:number
    content?:string
    startAt?:Date
    endAt?:Date
}

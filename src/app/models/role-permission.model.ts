import { Permission } from "./permission.model"
import { Role } from "./role.model"

export interface RolePermission {
    id?:string
    startAt?:Date
    endAt?:Date
    // Esto son relaciones (no se si esten bien...)
    roles?: Role[]
    permissions?: Permission[]
}

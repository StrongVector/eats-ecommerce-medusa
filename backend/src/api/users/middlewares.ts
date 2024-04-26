import { authenticate } from "@medusajs/medusa/dist/utils/authenticate-middleware"
import { ResAdminScopedMedusaRequest } from "../restaurants/types"
import { NextFunction, Response } from "express"
import { MiddlewareRoute } from "@medusajs/medusa"

const isAdmin = (
  req: ResAdminScopedMedusaRequest,
  res: Response,
  next: NextFunction
) => {
  const resAdmId = req.auth?.app_metadata?.restaurant_admin_id

  if (!resAdmId) {
    return res.status(403).json({ message: "Unauthorized" })
  }

  req.restaurant_admin_id = resAdmId

  console.log("isAdmin middleware", resAdmId)

  return next()
}

export const usersMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/users/me",
    middlewares: [authenticate("restaurant", ["bearer"]), isAdmin],
  },
]
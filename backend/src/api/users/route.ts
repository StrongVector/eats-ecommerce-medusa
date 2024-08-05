import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ModuleRegistrationName } from "@medusajs/utils";
import jwt from "jsonwebtoken";
import zod from "zod";

import {
  CreateDriverInput,
  createUserWorkflow,
} from "../../workflows/user/workflows/create-user";

const schema = zod
  .object({
    email: zod.string().email(),
    first_name: zod.string(),
    last_name: zod.string(),
    phone: zod.string(),
    avatar_url: zod.string().optional(),
    restaurant_id: zod.string().optional(),
    actor_type: zod.ZodEnum.create(["restaurant", "driver"]),
  })
  .required({
    email: true,
    first_name: true,
    last_name: true,
    phone: true,
    actor_type: true,
  });

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { auth_identity_id } = req.auth_context;

  const validatedBody = schema.parse(req.body) as CreateDriverInput & {
    actor_type: "restaurant" | "driver";
  };

  const { result, errors } = await createUserWorkflow(req.scope).run({
    input: {
      user: validatedBody,
      auth_identity_id,
    },
    throwOnError: false,
  });

  if (Array.isArray(errors) && errors[0]) {
    throw errors[0].error;
  }

  const authService = req.scope.resolve(ModuleRegistrationName.AUTH);

  const authUser = await authService.retrieveAuthIdentity(auth_identity_id);
  const { jwtSecret } = req.scope.resolve("configModule").projectConfig.http;

  const token = jwt.sign(authUser, jwtSecret, {
    algorithm: "HS256",
  });

  res.status(201).json({ user: result, token });
};

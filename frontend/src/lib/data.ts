import { DeliveryDTO, DriverDTO } from "@backend/src/types/delivery/common";
import { RestaurantDTO } from "@backend/src/types/restaurant/common";
import { createSession, retrieveSession } from "./sessions";

export const BACKEND_URL = "http://localhost:9000";

export async function retrieveRestaurant(
  restaurantId: string
): Promise<RestaurantDTO> {
  const { restaurant } = await fetch(
    `${BACKEND_URL}/restaurants/${restaurantId}`,
    {
      next: {
        tags: ["restaurants"],
      },
    }
  ).then((res) => res.json());
  return restaurant;
}

export async function retrieveDriver(driverId: string): Promise<DriverDTO> {
  const { driver } = await fetch(`${BACKEND_URL}/drivers/${driverId}`, {
    next: {
      tags: ["drivers"],
    },
  }).then((res) => res.json());
  return driver;
}

export async function listDeliveries(
  filter?: Record<string, string>
): Promise<DeliveryDTO[]> {
  const query = new URLSearchParams(filter).toString();

  const { deliveries } = await fetch(`${BACKEND_URL}/deliveries?${query}`, {
    next: {
      tags: ["deliveries"],
    },
  }).then((res) => res.json());
  return deliveries;
}

export async function listCategories() {
  const { categories } = await fetch(`${BACKEND_URL}/categories`, {
    next: {
      tags: ["restaurants"],
    },
  }).then((res) => res.json());

  return categories;
}

export async function retrieveRestaurantByHandle(
  handle: string
): Promise<RestaurantDTO> {
  const { restaurants } = await fetch(
    `${BACKEND_URL}/restaurants?handle=${handle}`,
    {
      next: {
        tags: ["restaurants"],
      },
    }
  ).then((res) => res.json());
  return restaurants[0];
}

export async function retrieveCart(cartId: string) {
  const { cart } = await fetch(`${BACKEND_URL}/store/carts/${cartId}`, {
    next: {
      tags: ["cart"],
    },
  }).then((res) => res.json());
  console.log("retrieveCart", cart);
  return cart;
}

export async function retrieveUser() {
  const token = await retrieveSession();

  if (!token) {
    return null;
  }

  const { user } = await fetch(`${BACKEND_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      tags: ["user"],
    },
  }).then((res) => res.json());
  console.log("retrieveUser", user);

  return user;
}

export async function getAndSetToken({
  email,
  password,
  scope,
  provider,
}: {
  email: string;
  password: string;
  scope: "customer" | "restaurant" | "driver";
  provider: "emailpass";
}) {
  console.log({ email, password, scope, provider });

  const { token } = await fetch(`${BACKEND_URL}/auth/${scope}/${provider}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password: password.toString() }),
    next: {
      tags: ["user"],
    },
  }).then((res) => res.json());

  if (!token) {
    throw new Error("Invalid email or password");
  }

  await createSession(token);

  return token;
}

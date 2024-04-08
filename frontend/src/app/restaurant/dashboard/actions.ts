"use server";

import {
  DeliveryDTO,
  DeliveryStatus,
} from "@backend/src/types/delivery/common";
import { revalidateTag } from "next/cache";

const BACKEND_URL = "http://localhost:9000";

export async function proceedDelivery(delivery: DeliveryDTO) {
  if (delivery.delivery_status === DeliveryStatus.PENDING) {
    await acceptDelivery(delivery.id);
  }

  if (delivery.delivery_status === DeliveryStatus.PICKUP_CLAIMED) {
    return await prepareDelivery(delivery.id);
  }

  if (delivery.delivery_status === DeliveryStatus.RESTAURANT_PREPARING) {
    return await preparationReady(delivery.id);
  }

  console.log("Invalid delivery status", delivery.delivery_status);

  return null;
}

export async function acceptDelivery(
  deliveryId: string
): Promise<DeliveryDTO | null> {
  try {
    const { delivery } = await fetch(
      `${BACKEND_URL}/deliveries/${deliveryId}/accept`,
      {
        method: "POST",
        next: {
          tags: ["deliveries"],
        },
      }
    ).then((res) => res.json());

    console.log("Delivery accepted", deliveryId);

    revalidateTag("deliveries");

    return delivery;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function declineDelivery(
  deliveryId: string
): Promise<DeliveryDTO | null> {
  try {
    const { delivery } = await fetch(
      `${BACKEND_URL}/deliveries/${deliveryId}/decline`,
      {
        method: "POST",
        next: {
          tags: ["deliveries"],
        },
      }
    ).then((res) => res.json());

    console.log("Delivery declined", deliveryId);
    revalidateTag("deliveries");

    return delivery;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function prepareDelivery(
  deliveryId: string
): Promise<DeliveryDTO | null> {
  try {
    const { delivery } = await fetch(
      `${BACKEND_URL}/deliveries/${deliveryId}/prepare`,
      {
        method: "POST",
        next: {
          tags: ["deliveries"],
        },
      }
    ).then((res) => res.json());

    revalidateTag("deliveries");

    console.log("Restarant is preparing order", deliveryId);

    return delivery;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function preparationReady(
  deliveryId: string
): Promise<DeliveryDTO | null> {
  try {
    const { delivery } = await fetch(
      `${BACKEND_URL}/deliveries/${deliveryId}/ready`,
      {
        method: "POST",
        next: {
          tags: ["deliveries"],
        },
      }
    ).then((res) => res.json());

    console.log("Delivery is ready for pickup", deliveryId);

    revalidateTag("deliveries");

    return delivery;
  } catch (error) {
    console.log(error);
    return null;
  }
}

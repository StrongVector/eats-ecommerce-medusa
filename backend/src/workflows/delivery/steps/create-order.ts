import { CreateOrderShippingMethodDTO } from "@medusajs/order";
import { IOrderModuleService } from "@medusajs/types";
import { remoteQueryObjectFromString } from "@medusajs/utils";
import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { IDeliveryModuleService } from "../../../types/delivery/common";

export const createOrderStepId = "create-order-step";
export const createOrderStep = createStep(
  createOrderStepId,
  async function (deliveryId: string, { container }) {
    const remoteQuery = container.resolve("remoteQuery");

    const deliveryQuery = remoteQueryObjectFromString({
      entryPoint: "deliveries",
      variables: {
        filters: {
          id: deliveryId,
        },
      },
      fields: ["id", "cart_id", "delivery_status", "driver_id"],
    });

    const delivery = await remoteQuery(deliveryQuery).then((res) => res[0]);

    const cartQuery = remoteQueryObjectFromString({
      entryPoint: "carts",
      fields: ["*", "items.*"],
      variables: {
        filters: {
          id: delivery.cart_id,
        },
      },
    });

    const cart = await remoteQuery(cartQuery).then((res) => res[0]);

    const orderModuleService =
      container.resolve<IOrderModuleService>("orderModuleService");

    const order = await orderModuleService.create({
      currency_code: cart.currency_code,
      email: cart.email,
      shipping_address: cart.shipping_address,
      billing_address: cart.billing_address,
      items: cart.items,
      region_id: cart.region_id,
      customer_id: cart.customer_id,
      sales_channel_id: cart.sales_channel_id,
      shipping_methods:
        cart.shipping_methods as unknown as CreateOrderShippingMethodDTO[],
    });

    delivery.order_id = order?.id;

    const deliveryModuleService = container.resolve<IDeliveryModuleService>(
      "deliveryModuleService"
    );

    await deliveryModuleService.update([
      {
        id: deliveryId,
        order_id: order?.id,
      },
    ]);

    return new StepResponse(order, {
      orderId: order.id,
      deliveryId,
    });
  },
  async (
    {
      orderId,
      deliveryId,
    }: {
      orderId: string;
      deliveryId: string;
    },
    { container }
  ) => {
    const deliveryService = container.resolve<IDeliveryModuleService>(
      "deliveryModuleService"
    );

    await deliveryService.update([
      {
        id: deliveryId,
        order_id: null,
      },
    ]);

    const orderService =
      container.resolve<IOrderModuleService>("orderModuleService");

    await orderService.delete(orderId);
  }
);

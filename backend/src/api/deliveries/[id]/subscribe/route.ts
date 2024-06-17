import { MedusaResponse } from "@medusajs/medusa";
import { ModuleRegistrationName } from "@medusajs/modules-sdk";
import {
  IEventBusModuleService,
  IWorkflowEngineService,
} from "@medusajs/types";
import { IDeliveryModuleService } from "../../../../types/delivery/common";
import { handleDeliveryWorkflowId } from "../../../../workflows/workflows/handle-delivery";
import { AuthUserScopedMedusaRequest } from "../../../types";

type RestaurantNotificationData = {
  restaurant_id: string;
  delivery_id: string;
};

type DriverNotificationData = {
  drivers: string[];
  delivery_id: string;
};

export const GET = async (
  req: AuthUserScopedMedusaRequest,
  res: MedusaResponse
) => {
  const deliveryId = req.params.id;
  const restaurantId = req.query.restaurant_id as string;
  const driverId = req.query.driver_id as string;

  const deliveryService = req.scope.resolve<IDeliveryModuleService>(
    "deliveryModuleService"
  );

  const delivery = await deliveryService.retrieveDelivery(deliveryId);

  if (!delivery) {
    return res.status(404).json({ message: "No deliveries found" });
  }

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  };

  res.writeHead(200, headers);

  const workflowEngine = req.scope.resolve<IWorkflowEngineService>(
    ModuleRegistrationName.WORKFLOW_ENGINE
  );

  const workflowSubHandler = (data: any) => {
    res.write("data: " + JSON.stringify(data) + "\n\n");
  };

  await workflowEngine.subscribe({
    workflowId: handleDeliveryWorkflowId,
    transactionId: delivery.transaction_id,
    subscriber: workflowSubHandler,
  });

  res.write(
    "data: " +
      JSON.stringify({
        message: "Subscribed to workflow",
        transactionId: delivery.transaction_id,
      }) +
      "\n\n"
  );

  const eventBus = req.scope.resolve<IEventBusModuleService>(
    ModuleRegistrationName.EVENT_BUS
  );

  if (restaurantId) {
    eventBus.subscribe(
      "notify.restaurant",
      async (data: RestaurantNotificationData) => {
        if (data.restaurant_id !== restaurantId) {
          return;
        }

        const delivery = await deliveryService.retrieveDelivery(
          data.delivery_id
        );

        await workflowEngine.subscribe({
          workflowId: handleDeliveryWorkflowId,
          transactionId: delivery.transaction_id,
          subscriber: workflowSubHandler,
        });

        res.write(
          "data: " +
            JSON.stringify({
              message: "Subscribed to workflow",
              transactionId: delivery.transaction_id,
              new: true,
            }) +
            "\n\n"
        );
      }
    );
  }

  if (driverId) {
    eventBus.subscribe(
      "notify.drivers",
      async (data: DriverNotificationData) => {
        if (!data.drivers.includes(driverId)) {
          console.log("Driver not included");
          return;
        }

        const delivery = await deliveryService.retrieveDelivery(
          data.delivery_id
        );

        await workflowEngine.subscribe({
          workflowId: handleDeliveryWorkflowId,
          transactionId: delivery.transaction_id,
          subscriber: workflowSubHandler,
        });

        res.write(
          "data: " +
            JSON.stringify({
              message: "Subscribed to workflow",
              transactionId: delivery.transaction_id,
              new: true,
            }) +
            "\n\n"
        );
      }
    );
  }
};

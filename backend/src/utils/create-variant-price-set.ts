import { MedusaContainer } from "@medusajs/modules-sdk";
import {
  CreatePriceSetDTO,
  IPricingModuleService,
  PriceSetDTO,
} from "@medusajs/types";
import { Modules } from "@medusajs/utils";

export const createVariantPriceSet = async ({
  container,
  variantId,
  prices,
}: {
  container: MedusaContainer;
  variantId: string;
  prices: CreatePriceSetDTO["prices"];
}): Promise<PriceSetDTO> => {
  const remoteLink = container.resolve("remoteLink");
  const pricingModuleService: IPricingModuleService = container.resolve(
    "pricingModuleService"
  );

  const priceSet = await pricingModuleService.createPriceSets({
    prices,
  });

  await remoteLink.create({
    [Modules.PRODUCT]: { variant_id: variantId },
    [Modules.PRICING]: { price_set_id: priceSet.id },
  });

  return await pricingModuleService.retrievePriceSet(priceSet.id, {
    relations: ["prices"],
  });
};

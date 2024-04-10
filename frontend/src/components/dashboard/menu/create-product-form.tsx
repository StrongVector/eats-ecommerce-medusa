"use client";

import { RestaurantDTO } from "@backend/src/types/restaurant/common";
import { createProduct } from "@frontend/app/dashboard/restaurant/actions";
import { Input, Select, Textarea } from "@medusajs/ui";
import { useFormState } from "react-dom";

export function CreateProductForm({
  restaurant,
  categories,
}: {
  restaurant: RestaurantDTO;
  categories: {
    id: string;
    name: string;
  }[];
}) {
  const [state, formAction] = useFormState(createProduct, null);

  return (
    <form
      className="flex flex-col gap-3"
      name="create-product"
      id="create-product"
      action={formAction}
    >
      <input type="hidden" name="restaurant_id" value={restaurant.id} />
      <Input placeholder="Title" name="title" />
      <Textarea placeholder="Description" name="description" />
      <Select name="category_id">
        <Select.Trigger>
          <Select.Value placeholder="Select a category" />
        </Select.Trigger>
        <Select.Content className="z-[50]">
          {categories.map((category) => (
            <Select.Item key={category.id} value={category.id}>
              {category.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Input placeholder="Price" name="price" type="number" />
    </form>
  );
}

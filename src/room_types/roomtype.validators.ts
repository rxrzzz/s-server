import { z } from "zod";

const createRoomTypeValidator = z.object({
  name: z.string({ required_error: "Room Type value should be provided." }),
  price: z.coerce.string({ required_error: "Price should be provided" }),
  features: z.array(z.string(), {
    required_error: "Feature list should be provided",
  }),
  description: z.string({
    required_error: "Room Type description should be provided.",
  }),
});

const roomTypeNameValidator = z.object({
  name: z.string({ required_error: "Room Type value should be provided." }),
});

const updateRoomTypeValidator = z.object({
  name: z.string().optional(),
  price: z.coerce.string().optional(),
  features: z.array(z.string()).optional(),
  description: z.string().optional(),
  imageFileNames: z.array(z.string()).optional(),
  roomImageURLS: z.array(z.string()).optional(),
});

const roomTypeImageUploadValidator = z.object({
  name: z.string({ required_error: "Room Type value should be provided." }),
  files: z.array(
    z.object({
      fieldname: z.string(),
      originalName: z.string(),
      encoding: z.string(),
      mimetype: z.string(),
      size: z.number(),
      destination: z.string().optional(),
      filename: z.string().optional(),
      path: z.string().optional(),
      buffer: z.instanceof(Buffer).optional(),
    })
  ),
});

export const v = {
  createRoomTypeValidator,
  roomTypeNameValidator,
  updateRoomTypeValidator,
  roomTypeImageUploadValidator
};

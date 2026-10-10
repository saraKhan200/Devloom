// this is the main file for ALL the schemas used in mcp/tools/github !!
import { z } from "zod";

export const universalErrorSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
    }),
  ),
  isError: z.boolean(),
});

// below here we safely convert the zod schemas to Typescript types :D

/**
 * main Error typescript type exported only in client.ts which handels errors and returns them
 */
export type universalError = z.infer<typeof universalErrorSchema>;

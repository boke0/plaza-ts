[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / validator

# Function: validator()

> **validator**\<`S`\>(`schema`): [`Validator`](../interfaces/Validator.md)\<`InferOutput`\<`S`\>\>

Defined in: [validator.ts:87](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/validator.ts#L87)

Build a [Validator](../interfaces/Validator.md) from a StandardSchema-compatible schema.

Pass the result to [Plaza.on](../classes/Plaza.md#on), and inside the handler call
`c.valid("json")` to read the validated, type-inferred payload.

## Type Parameters

### S

`S` *extends* `StandardSchemaV1`\<`unknown`, `unknown`\>

StandardSchema-compatible schema type

## Parameters

### schema

`S`

Any schema that implements StandardSchema (zod, etc.)

## Returns

[`Validator`](../interfaces/Validator.md)\<`InferOutput`\<`S`\>\>

A [Validator](../interfaces/Validator.md) that validates payloads with the given schema

## Example

```ts
import { validator } from "plaza-ts";
import { z } from "zod";

plaza.on(
  "login",
  validator(z.object({ token: z.string() })),
  (c) => {
    const { token } = c.valid("json"); // inferred as { token: string }
  }
);
```

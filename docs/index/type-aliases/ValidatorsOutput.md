[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / ValidatorsOutput

# Type Alias: ValidatorsOutput\<V\>

> **ValidatorsOutput**\<`V`\> = `UnionToIntersection`\<`{ [I in keyof V]: V[I] extends Validator<infer O> ? O : never }`\[`number`\]\>

Defined in: [types.ts:64](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/types.ts#L64)

Intersects the outputs of multiple [Validator](../interfaces/Validator.md)s into a single type.

When [Plaza.on](../classes/Plaza.md#on) is called with multiple validators, the final payload
type is the intersection of every validator's output.

## Type Parameters

### V

`V` *extends* readonly [`Validator`](../interfaces/Validator.md)\<`unknown`\>[]

A readonly tuple of [Validator](../interfaces/Validator.md)s

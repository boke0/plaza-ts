[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Validator

# Interface: Validator\<Out\>

Defined in: validator.ts:13

Single payload-validation strategy.

Any value passed as a validator argument to [Plaza.on](../classes/Plaza.md#on) must conform to
this shape. In typical usage you construct one via [validator](../functions/validator.md).

## Type Parameters

### Out

`Out`

Output type after validation

## Properties

### target

> `readonly` **target**: `"json"`

Defined in: validator.ts:24

Validation target. Only `"json"` is supported today.

## Methods

### validate()

> **validate**(`input`): `Promise`\<`Out`\>

Defined in: validator.ts:34

Validate the incoming payload and return the validated value.

Throws [ValidationError](../classes/ValidationError.md) on schema failure.

#### Parameters

##### input

`unknown`

Incoming payload

#### Returns

`Promise`\<`Out`\>

#### Throws

[ValidationError](../classes/ValidationError.md) when validation fails

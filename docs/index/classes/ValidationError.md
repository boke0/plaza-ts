[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / ValidationError

# Class: ValidationError

Defined in: validator.ts:45

Error thrown when payload validation fails.

The `issues` property carries the StandardSchema-formatted details produced
by the underlying schema library.

## Extends

- `Error`

## Constructors

### Constructor

> **new ValidationError**(`issues`): `ValidationError`

Defined in: validator.ts:52

#### Parameters

##### issues

readonly `Issue`[]

Issues returned by the StandardSchema validator

#### Returns

`ValidationError`

#### Overrides

`Error.constructor`

## Properties

### issues

> `readonly` **issues**: readonly `Issue`[]

Defined in: validator.ts:47

StandardSchema issues produced by the failing schema.

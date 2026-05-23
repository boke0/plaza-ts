[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / ValidationError

# Class: ValidationError

Defined in: [validator.ts:45](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/validator.ts#L45)

Error thrown when payload validation fails.

The `issues` property carries the StandardSchema-formatted details produced
by the underlying schema library.

## Extends

- `Error`

## Constructors

### Constructor

> **new ValidationError**(`issues`): `ValidationError`

Defined in: [validator.ts:52](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/validator.ts#L52)

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

Defined in: [validator.ts:47](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/validator.ts#L47)

StandardSchema issues produced by the failing schema.

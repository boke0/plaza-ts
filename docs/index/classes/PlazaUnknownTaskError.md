[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / PlazaUnknownTaskError

# Class: PlazaUnknownTaskError

Defined in: [plaza.ts:67](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L67)

Thrown by [Plaza.runTask](Plaza.md#runtask) when the requested task name is not
registered on the Plaza.

## Extends

- `Error`

## Constructors

### Constructor

> **new PlazaUnknownTaskError**(`taskName`): `PlazaUnknownTaskError`

Defined in: [plaza.ts:68](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L68)

#### Parameters

##### taskName

`string`

#### Returns

`PlazaUnknownTaskError`

#### Overrides

`Error.constructor`

## Properties

### taskName

> `readonly` **taskName**: `string`

Defined in: [plaza.ts:68](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/plaza.ts#L68)

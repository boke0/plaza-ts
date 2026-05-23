[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / PlazaAttachmentTooLargeError

# Class: PlazaAttachmentTooLargeError

Defined in: [connection.ts:33](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L33)

Thrown when a connection's serialized attachment exceeds the configured limit.

Cloudflare Durable Objects impose a practical cap on `serializeAttachment`,
so Plaza guards against it using [PlazaOptions.maxAttachmentBytes](../interfaces/PlazaOptions.md#maxattachmentbytes).

## Extends

- `Error`

## Constructors

### Constructor

> **new PlazaAttachmentTooLargeError**(`connectionId`, `bytes`, `limit`): `PlazaAttachmentTooLargeError`

Defined in: [connection.ts:39](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L39)

#### Parameters

##### connectionId

`string`

Id of the connection whose attachment overflowed

##### bytes

`number`

Actual serialized size in bytes

##### limit

`number`

Configured size limit in bytes

#### Returns

`PlazaAttachmentTooLargeError`

#### Overrides

`Error.constructor`

## Properties

### connectionId

> `readonly` **connectionId**: `string`

Defined in: [connection.ts:40](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L40)

Id of the connection whose attachment overflowed

***

### bytes

> `readonly` **bytes**: `number`

Defined in: [connection.ts:41](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L41)

Actual serialized size in bytes

***

### limit

> `readonly` **limit**: `number`

Defined in: [connection.ts:42](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L42)

Configured size limit in bytes

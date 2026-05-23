[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / PlazaAttachmentTooLargeError

# Class: PlazaAttachmentTooLargeError

Defined in: connection.ts:33

Thrown when a connection's serialized attachment exceeds the configured limit.

Cloudflare Durable Objects impose a practical cap on `serializeAttachment`,
so Plaza guards against it using [PlazaOptions.maxAttachmentBytes](../interfaces/PlazaOptions.md#maxattachmentbytes).

## Extends

- `Error`

## Constructors

### Constructor

> **new PlazaAttachmentTooLargeError**(`connectionId`, `bytes`, `limit`): `PlazaAttachmentTooLargeError`

Defined in: connection.ts:39

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

Defined in: connection.ts:40

Id of the connection whose attachment overflowed

***

### bytes

> `readonly` **bytes**: `number`

Defined in: connection.ts:41

Actual serialized size in bytes

***

### limit

> `readonly` **limit**: `number`

Defined in: connection.ts:42

Configured size limit in bytes

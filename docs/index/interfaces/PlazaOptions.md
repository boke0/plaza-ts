[**plaza-ts v0.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / PlazaOptions

# Interface: PlazaOptions

Defined in: plaza.ts:31

Options accepted by the [Plaza](../classes/Plaza.md) constructor.

## Properties

### maxAttachmentBytes?

> `optional` **maxAttachmentBytes?**: `number`

Defined in: plaza.ts:40

Maximum byte size of the serialized attachment written via
`serializeAttachment` per connection.

Exceeding the limit throws [PlazaAttachmentTooLargeError](../classes/PlazaAttachmentTooLargeError.md).

#### Default Value

```ts
2048
```

***

### idFactory?

> `optional` **idFactory?**: () => `string`

Defined in: plaza.ts:50

Factory for generating connection ids.

Defaults to `crypto.randomUUID()` and falls back to a time+random string
when the API is not available.

#### Returns

`string`

#### Default Value

`crypto.randomUUID`

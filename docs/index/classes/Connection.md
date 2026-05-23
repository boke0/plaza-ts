[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / Connection

# Class: Connection\<State\>

Defined in: [connection.ts:72](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L72)

Represents a single WebSocket connection.

Plaza holds one `Connection` per active socket and uses `tag`, `channel`,
and `state` to classify and address connections.

## Remarks

`Connection` instances are not constructed by user code; you receive them
from a [Context](../type-aliases/Context.md) during dispatch.

## Type Parameters

### State

`State` = `Record`\<`string`, `unknown`\>

Application-defined state type

## Properties

### id

> `readonly` **id**: `string`

Defined in: [connection.ts:77](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L77)

Stable identifier of the connection. Generation is configurable via
[PlazaOptions.idFactory](../interfaces/PlazaOptions.md#idfactory).

***

### state

> **state**: `State`

Defined in: [connection.ts:82](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L82)

Application-defined metadata. Patch with [Connection.setState](#setstate).

## Accessors

### tags

#### Get Signature

> **get** **tags**(): `ReadonlySet`\<`string`\>

Defined in: [connection.ts:117](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L117)

Read-only view of the tags attached to this connection.

##### Returns

`ReadonlySet`\<`string`\>

***

### channels

#### Get Signature

> **get** **channels**(): `ReadonlySet`\<`string`\>

Defined in: [connection.ts:124](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L124)

Read-only view of the channels this connection belongs to.

##### Returns

`ReadonlySet`\<`string`\>

## Methods

### setTag()

> **setTag**(`tag`): `void`

Defined in: [connection.ts:135](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L135)

Attach a tag to this connection and index it in the registry.

No-op when the tag is already present or the connection is closed.

#### Parameters

##### tag

`string`

Tag to attach

#### Returns

`void`

***

### removeTag()

> **removeTag**(`tag`): `void`

Defined in: [connection.ts:149](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L149)

Remove a tag from this connection and drop it from the index.

No-op when the tag is not currently attached.

#### Parameters

##### tag

`string`

Tag to remove

#### Returns

`void`

***

### joinChannel()

> **joinChannel**(`channel`): `void`

Defined in: [connection.ts:162](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L162)

Join the connection to a channel and add it to the channel index.

No-op when already joined or when the connection is closed.

#### Parameters

##### channel

`string`

Channel to join

#### Returns

`void`

***

### leaveChannel()

> **leaveChannel**(`channel`): `void`

Defined in: [connection.ts:176](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L176)

Leave a channel and drop the connection from the channel index.

No-op when the connection has not joined the channel.

#### Parameters

##### channel

`string`

Channel to leave

#### Returns

`void`

***

### setState()

> **setState**(`partial`): `void`

Defined in: [connection.ts:190](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L190)

Patch `state` by shallow-merging the provided partial.

Existing fields are preserved; only the keys present in `partial` are
overwritten.

#### Parameters

##### partial

`Partial`\<`State`\>

Keys and values to merge in

#### Returns

`void`

***

### emit()

> **emit**(`event`, `payload`): `void`

Defined in: [connection.ts:204](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L204)

Send an event to this single connection.

If the send fails (for example, the underlying socket is already closed),
the connection is automatically dropped from the registry.

#### Parameters

##### event

`string`

Event name

##### payload

`unknown`

Arbitrary payload

#### Returns

`void`

***

### close()

> **close**(`code?`, `reason?`): `void`

Defined in: [connection.ts:223](https://github.com/boke0/plaza-ts/blob/426bedbd9c3e8df60e130dbeccfab412875d3651/src/connection.ts#L223)

Close the connection.

The connection is removed from the registry immediately, so subsequent
`c.to({ tag })` / `c.emit()` calls in the same dispatch tick will not
target this socket. Idempotent with the later `webSocketClose` cleanup.

#### Parameters

##### code?

`number` = `1000`

WebSocket close code (default: `1000`, Normal Closure)

##### reason?

`string` = `""`

Close reason string (default: empty string)

#### Returns

`void`

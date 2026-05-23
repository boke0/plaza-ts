[**plaza-ts v1.0.0**](../../README.md)

***

[plaza-ts](../../README.md) / [index](../README.md) / PlazaKindMismatchError

# Class: PlazaKindMismatchError

Defined in: [plaza.ts:38](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/plaza.ts#L38)

Thrown / dispatched when a route is invoked through the wrong kind of entry
point: e.g. a client sends a name registered as a [task](Plaza.md#task),
or [Plaza.runTask](Plaza.md#runtask) is called with a name registered as a
[handle](Plaza.md#handle).

## Extends

- `Error`

## Constructors

### Constructor

> **new PlazaKindMismatchError**(`routeName`, `expected`, `actual`): `PlazaKindMismatchError`

Defined in: [plaza.ts:46](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/plaza.ts#L46)

#### Parameters

##### routeName

`string`

##### expected

`"message"` \| `"task"`

##### actual

`"message"` \| `"task"`

#### Returns

`PlazaKindMismatchError`

#### Overrides

`Error.constructor`

## Properties

### expected

> `readonly` **expected**: `"message"` \| `"task"`

Defined in: [plaza.ts:40](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/plaza.ts#L40)

Kind expected by the caller (e.g. `"message"` for incoming WS frames).

***

### actual

> `readonly` **actual**: `"message"` \| `"task"`

Defined in: [plaza.ts:42](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/plaza.ts#L42)

Kind actually registered for `routeName`.

***

### routeName

> `readonly` **routeName**: `string`

Defined in: [plaza.ts:44](https://github.com/boke0/plaza-ts/blob/20ad3bc368f55709ec968cd70f4e701017d71e9f/src/plaza.ts#L44)

Name of the route that was looked up.

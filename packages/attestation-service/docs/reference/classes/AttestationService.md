# Class: AttestationService

Service for performing attestation operations to a connector.

## Implements

- `IAttestationComponent`
- `IHealthProviderComponent`

## Constructors

### Constructor

> **new AttestationService**(`options?`): `AttestationService`

Create a new instance of AttestationService.

#### Parameters

##### options?

[`IAttestationServiceConstructorOptions`](../interfaces/IAttestationServiceConstructorOptions.md)

The options for the service.

#### Returns

`AttestationService`

#### Throws

If no attestation connectors are registered.

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### className() {#classname}

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`IAttestationComponent.className`

***

### healthApplication() {#healthapplication}

> **healthApplication**(`callback`): `Promise`\<`IHealth`[] \| `undefined`\>

Runs a full attestation lifecycle (create, get, destroy) against the organisation identity
in the current context and returns the result directly.

#### Parameters

##### callback

`HealthApplicationCallback`

The callback to invoke when a deferred health result is ready.

#### Returns

`Promise`\<`IHealth`[] \| `undefined`\>

The health status of the service.

#### Implementation of

`IHealthProviderComponent.healthApplication`

***

### start() {#start}

> **start**(): `Promise`\<`void`\>

Register all attestation metrics with the telemetry component.

#### Returns

`Promise`\<`void`\>

A promise that resolves when all metrics have been registered.

#### Implementation of

`IAttestationComponent.start`

***

### create() {#create}

> **create**(`attestationObject`, `namespace?`): `Promise`\<`string`\>

Attest the data and return the collated information.

#### Parameters

##### attestationObject

`IJsonLdNodeObject`

The data to attest.

##### namespace?

`string`

The namespace of the connector to use for the attestation, defaults to service configured namespace.

#### Returns

`Promise`\<`string`\>

The id of the created attestation.

#### Implementation of

`IAttestationComponent.create`

***

### get() {#get}

> **get**(`id`): `Promise`\<`IAttestationInformation`\>

Resolve and verify the attestation id.

#### Parameters

##### id

`string`

The attestation id to verify.

#### Returns

`Promise`\<`IAttestationInformation`\>

The verified attestation details.

#### Implementation of

`IAttestationComponent.get`

***

### transfer() {#transfer}

> **transfer**(`attestationId`, `holderAddress`): `Promise`\<`void`\>

Transfer the attestation to a new holder.

#### Parameters

##### attestationId

`string`

The attestation to transfer.

##### holderAddress

`string`

The address to transfer the attestation to.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the transfer is complete.

#### Implementation of

`IAttestationComponent.transfer`

***

### destroy() {#destroy}

> **destroy**(`attestationId`): `Promise`\<`void`\>

Destroy the attestation.

#### Parameters

##### attestationId

`string`

The attestation to destroy.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the attestation has been destroyed.

#### Implementation of

`IAttestationComponent.destroy`

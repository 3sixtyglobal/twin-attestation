# Class: NftAttestationConnector

Class for performing attestation operations in nfts.

## Implements

- `IAttestationConnector`

## Constructors

### Constructor

> **new NftAttestationConnector**(`options?`): `NftAttestationConnector`

Create a new instance of NftAttestationConnector.

#### Parameters

##### options?

[`INftAttestationConnectorConstructorOptions`](../interfaces/INftAttestationConnectorConstructorOptions.md)

The options for the attestation connector.

#### Returns

`NftAttestationConnector`

## Properties

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

***

### NAMESPACE {#namespace}

> `readonly` `static` **NAMESPACE**: `string` = `"nft"`

The namespace for the entities.

## Methods

### className() {#classname}

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`IAttestationConnector.className`

***

### create() {#create}

> **create**(`controller`, `verificationMethodId`, `attestationObject`): `Promise`\<`string`\>

Attest the data and return the collated information.

#### Parameters

##### controller

`string`

The controller identity of the user to access the vault keys.

##### verificationMethodId

`string`

The identity verification method to use for attesting the data.

##### attestationObject

`IJsonLdNodeObject`

The data to attest.

#### Returns

`Promise`\<`string`\>

The id of the attestation.

#### Implementation of

`IAttestationConnector.create`

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

`IAttestationConnector.get`

***

### transfer() {#transfer}

> **transfer**(`controller`, `attestationId`, `holderAddress`): `Promise`\<`void`\>

Transfer the attestation to a new holder.

#### Parameters

##### controller

`string`

The controller identity of the user to access the vault keys.

##### attestationId

`string`

The attestation to transfer.

##### holderAddress

`string`

The new controller address of the attestation belonging to the holder.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the transfer is complete.

#### Implementation of

`IAttestationConnector.transfer`

***

### destroy() {#destroy}

> **destroy**(`controller`, `attestationId`): `Promise`\<`void`\>

Destroy the attestation.

#### Parameters

##### controller

`string`

The controller identity of the user to access the vault keys.

##### attestationId

`string`

The attestation to destroy.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the attestation has been destroyed.

#### Implementation of

`IAttestationConnector.destroy`

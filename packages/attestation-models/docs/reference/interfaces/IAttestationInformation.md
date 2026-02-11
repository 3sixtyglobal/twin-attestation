# Interface: IAttestationInformation

Interface describing the collated attestation information.

## Properties

### @context

> **@context**: \[`"https://schema.org"`, `"https://schema.twindev.org/attestation/"`, `"https://schema.twindev.org/common/"`, `...IJsonLdContextDefinitionElement[]`\]

JSON-LD Context.

***

### type

> **type**: `"Information"`

JSON-LD Type.

***

### id

> **id**: `string`

The unique identifier of the attestation.

***

### dateCreated

> **dateCreated**: `string`

Created date/time of the attestation in ISO format.
json-ld namespace:schema

***

### dateTransferred?

> `optional` **dateTransferred**: `string`

Transferred date/time of the attestation in ISO format, can be blank if holder identity is owner.
json-ld type:schema:Date

***

### ownerIdentity

> **ownerIdentity**: `string`

The identity of the owner.
json-ld type:schema:identifier

***

### holderIdentity?

> `optional` **holderIdentity**: `string`

The identity of the current holder, can be undefined if owner is still the holder.
json-ld type:schema:identifier

***

### attestationObject

> **attestationObject**: `IJsonLdNodeObject`

The data that was attested.
json-ld namespace:twin-common

***

### proof?

> `optional` **proof**: `IJsonLdNodeObject`

The proof for the attested data.
json-ld namespace:twin-attestation

***

### verified?

> `optional` **verified**: `boolean`

Whether the attestation has been verified.
json-ld namespace:twin-common

***

### verificationFailure?

> `optional` **verificationFailure**: `string`

The verification failure message.
json-ld type:schema:Text

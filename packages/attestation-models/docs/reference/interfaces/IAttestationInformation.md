# Interface: IAttestationInformation

Interface describing the collated attestation information.

## Properties

### @context {#context}

> **@context**: \[`"https://schema.org"`, `"https://schema.twindev.org/attestation/"`, `"https://schema.twindev.org/common/"`, `...IJsonLdContextDefinitionElement[]`\]

JSON-LD Context.

***

### type {#type}

> **type**: `"Information"`

JSON-LD Type.

***

### id {#id}

> **id**: `string`

The unique identifier of the attestation.

***

### dateCreated {#datecreated}

> **dateCreated**: `string`

Created date/time of the attestation in ISO format.

***

### dateTransferred? {#datetransferred}

> `optional` **dateTransferred?**: `string`

Transferred date/time of the attestation in ISO format, can be blank if not yet transferred.

***

### ownerIdentity {#owneridentity}

> **ownerIdentity**: `string`

The identity of the owner.

***

### attestationObject {#attestationobject}

> **attestationObject**: `IJsonLdNodeObject`

The data that was attested.

***

### proof? {#proof}

> `optional` **proof?**: `IJsonLdNodeObject`

The proof for the attested data.

***

### verified? {#verified}

> `optional` **verified?**: `boolean`

Whether the attestation has been verified.

***

### verificationFailure? {#verificationfailure}

> `optional` **verificationFailure?**: `string`

The verification failure message.

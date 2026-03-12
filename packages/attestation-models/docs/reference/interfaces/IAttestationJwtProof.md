# Interface: IAttestationJwtProof

Interface describing an attestation proof.

## Properties

### @context {#context}

> **@context**: `"https://schema.twindev.org/attestation/"` \| \[`"https://schema.twindev.org/attestation/"`, `...IJsonLdContextDefinitionElement[]`\]

JSON-LD Context.

***

### type {#type}

> **type**: `"JwtProof"`

The type of the proof.

***

### value {#value}

> **value**: `string`

The value of the proof.

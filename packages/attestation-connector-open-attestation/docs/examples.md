# Attestation Connector Open Attestation Examples

Use these examples to wire a connector instance into your application now, while handling the current not-implemented behaviour in a predictable way.

## OpenAttestationConnector

```typescript
import { OpenAttestationConnector } from '@3sixty/attestation-connector-open-attestation';
import type { IJsonLdNodeObject } from '@3sixty/data-json-ld';

const connector = new OpenAttestationConnector({});

const className = connector.className();
console.log(className); // OpenAttestationConnector

const controller =
  'did:iota:tst:0x7c3b547454cc6c7d834bb2a49866f8dfbc5fbbe4f916ff1ec9a8be1ca2f31d5e';
const verificationMethodId = `${controller}#assertion-1`;
const attestationObject: IJsonLdNodeObject = {
  '@context': ['https://schema.org/'],
  type: 'EducationalOccupationalCredential',
  name: 'Certificate of Analysis',
  identifier: 'COA-2026-0412'
};

try {
  await connector.create(controller, verificationMethodId, attestationObject);
} catch (error) {
  console.log((error as Error).name); // NotImplementedError
}

try {
  await connector.get('attestation:urn:attestation:open-attestation:sample-attestation-id');
} catch (error) {
  console.log((error as Error).name); // NotImplementedError
}
```

```typescript
import { OpenAttestationConnector } from '@3sixty/attestation-connector-open-attestation';

const connector = new OpenAttestationConnector({});

try {
  await connector.transfer(
    'did:iota:tst:0x7c3b547454cc6c7d834bb2a49866f8dfbc5fbbe4f916ff1ec9a8be1ca2f31d5e',
    'attestation:urn:attestation:open-attestation:sample-attestation-id',
    'did:iota:tst:0x0c2544f34cd173008d5ea1c2ea5d90f518ff1a8745be5b2126788fbd1ee43896',
    'tst1qq6xgpm6xfjvpr4s9cegn6nzzd9zjff9f70q2e6lf0wpdw6f78k4vvfy2s'
  );
} catch (error) {
  console.log((error as Error).name); // NotImplementedError
}

try {
  await connector.destroy(
    'did:iota:tst:0x7c3b547454cc6c7d834bb2a49866f8dfbc5fbbe4f916ff1ec9a8be1ca2f31d5e',
    'attestation:urn:attestation:open-attestation:sample-attestation-id'
  );
} catch (error) {
  console.log((error as Error).name); // NotImplementedError
}
```

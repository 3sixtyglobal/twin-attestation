# Attestation REST Client Examples

These client-side snippets show how to call the REST API for creation, verification, transfer, and deletion from a typed TypeScript workflow.

## AttestationRestClient

```typescript
import { AttestationRestClient } from '@3sixty/attestation-rest-client';
import type { IJsonLdNodeObject } from '@3sixty/data-json-ld';

const client = new AttestationRestClient({
  endpoint: 'http://localhost:8080',
  basePath: '/api/'
});

const className = client.className();
console.log(className); // AttestationRestClient

const attestationObject: IJsonLdNodeObject = {
  '@context': ['https://schema.org/'],
  type: 'Invoice',
  identifier: 'INV-2026-00091',
  dateIssued: '2026-03-10'
};

const attestationId = await client.create(attestationObject, 'nft');
console.log(attestationId); // attestation:urn:attestation:nft:...

const verified = await client.get(attestationId);
console.log(verified.verified); // true
console.log(verified.id); // attestation:urn:attestation:nft:...
```

```typescript
import { AttestationRestClient } from '@3sixty/attestation-rest-client';

const client = new AttestationRestClient({
  endpoint: 'http://localhost:8080',
  basePath: '/api/'
});

const attestationId = 'attestation:urn:attestation:nft:aW90YS1uZnQ6dHN0OjB4M2I5Y2U3...';

await client.transfer(
  attestationId,
  'did:iota:tst:0x5526f5f1b5e89323f9f8b4447f6312bf90f1c47813f9c7038aebf0a032ea6d8d',
  'tst1qp70v5jmv6qe54vz0j3xqnqu8f2vrv7vv6u9jqwfd6rn2pd4kns89ve9u2'
);

await client.destroy(attestationId);
```

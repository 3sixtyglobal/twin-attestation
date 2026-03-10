# Attestation Service Examples

The following examples show how to orchestrate connector operations from one service instance, including namespace selection and lifecycle operations.

## AttestationService

```typescript
import { ContextIdKeys, ContextIdStore } from '@twin.org/context';
import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';
import { AttestationService } from '@twin.org/attestation-service';

await ContextIdStore.setContextId(
  ContextIdKeys.Organization,
  'did:iota:tst:0x6534f1f3257403d2f48f54fdd4dce3f6202f86e16df0f0d38994f5df2e2df009'
);

const service = new AttestationService({
  config: {
    defaultNamespace: 'nft',
    verificationMethodId: 'attestation-assertion'
  }
});

const className = service.className();
console.log(className); // AttestationService

const attestationObject: IJsonLdNodeObject = {
  '@context': ['https://schema.org/'],
  type: 'ParcelDelivery',
  identifier: 'SHIP-2026-1844',
  trackingNumber: 'TRACK-IT-117733'
};

const attestationId = await service.create(attestationObject, 'nft');
console.log(attestationId); // attestation:urn:attestation:nft:...

const details = await service.get(attestationId);
console.log(details.verified); // true
console.log(details.holderIdentity); // did:iota:tst:0x6534f1f3257403d2f48f54fdd4dce3f6202f86e16df0f0d38994f5df2e2df009
```

```typescript
import { AttestationService } from '@twin.org/attestation-service';

const service = new AttestationService({
  config: {
    defaultNamespace: 'nft',
    verificationMethodId: 'attestation-assertion'
  }
});

const attestationId = 'attestation:urn:attestation:nft:aW90YS1uZnQ6dHN0OjB4MmM0Y2Y1...';

await service.transfer(
  attestationId,
  'did:iota:tst:0x4c9fd6a33ce1292575d0b2375e72f0fddcc090448f4df2e59c108f2e667f39d1',
  'tst1qz8k9y3a0x60h4l7f9j9la2z5xa49q5klnvfm3ys4w5gpj4prxzkc9ln8v'
);

await service.destroy(attestationId);
```

# Attestation Connector NFT Examples

These snippets show a full attestation flow, from creating a claim to transferring ownership, plus ID conversion helpers used when working with NFT-backed attestations.

## NftAttestationConnector

```typescript
import { NftAttestationConnector } from '@twin.org/attestation-connector-nft';
import type { IJsonLdNodeObject } from '@twin.org/data-json-ld';

const connector = new NftAttestationConnector({
  config: {
    tag: 'SUPPLY-CHAIN'
  }
});

const controller =
  'did:iota:tst:0x98ebf9f7af4a9f6f597eb317a98af8fe9f602f909d1a6de50f26eb518f06806f';
const verificationMethodId = `${controller}#attestation-assertion`;

const attestationObject: IJsonLdNodeObject = {
  '@context': ['https://schema.org/'],
  type: 'DigitalDocument',
  name: 'bill-of-lading.pdf',
  identifier: 'BL-2026-000147',
  sha256: '8f537d67f0f2de4f65f80cde31f38f2d14516ff9b04474b51f8a78e6f42f5f0f'
};

const className = connector.className();
console.log(className); // NftAttestationConnector

const attestationId = await connector.create(controller, verificationMethodId, attestationObject);
console.log(attestationId); // attestation:urn:attestation:nft:...

const details = await connector.get(attestationId);
console.log(details.verified); // true
console.log(details.ownerIdentity); // did:iota:tst:0x98ebf9f7af4a9f6f597eb317a98af8fe9f602f909d1a6de50f26eb518f06806f
```

```typescript
import { NftAttestationConnector } from '@twin.org/attestation-connector-nft';

const connector = new NftAttestationConnector();

const controller =
  'did:iota:tst:0x98ebf9f7af4a9f6f597eb317a98af8fe9f602f909d1a6de50f26eb518f06806f';
const attestationId = 'attestation:urn:attestation:nft:aW90YS1uZnQ6dHN0OjB4YjJjNjU0...';

await connector.transfer(
  controller,
  attestationId,
  'did:iota:tst:0x4fcc2d40cdf27a025d6283ed4cbf3ba892dadf3c1547ec5a9de7e47cc687ab72',
  'tst1qrrw8zsrqvnl2m8qj9f6w8wxh8qrr5x92v0t8z9u9fk0w0qly9y9xjv5q2'
);

await connector.destroy(controller, attestationId);
```

## NftAttestationUtils

```typescript
import { NftAttestationUtils } from '@twin.org/attestation-connector-nft';

const nftId = 'urn:nft:iota:tst:0xb2c65417e89b709267cb7f3103318f3b77f52e3f7ac641f6f4d59ed8255e8761';

const attestationId = NftAttestationUtils.nftIdToAttestationId(nftId);
console.log(attestationId); // attestation:urn:attestation:nft:aW90YS1uZnQ6dHN0OjB4YjJjNjU0MTdlODliNzA5MjY3Y2I3ZjMxMDMzMThmM2I3N2Y1MmUzZjdhYzY0MWY2ZjRkNTllZDgyNTVlODc2MQ==

const roundTripNftId = NftAttestationUtils.attestationIdToNftId(attestationId);
console.log(roundTripNftId); // urn:nft:iota:tst:0xb2c65417e89b709267cb7f3103318f3b77f52e3f7ac641f6f4d59ed8255e8761
```

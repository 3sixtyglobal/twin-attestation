# Attestation Models Examples

Register the data types at startup so schemas and JSON-LD mappings are available before you parse or validate attestation payloads.

## AttestationDataTypes

```typescript
import { AttestationDataTypes } from '@3sixty/attestation-models';

AttestationDataTypes.registerTypes();
console.log('Attestation data types registered.'); // Attestation data types registered.
```

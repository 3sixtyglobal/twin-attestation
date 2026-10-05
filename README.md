# TWIN Attestation

This repository contains modular components for creating, verifying, transferring, and consuming attestations across different integration styles. The packages are designed to work together through shared contracts, so teams can compose model definitions, connector implementations, service orchestration, and client access without duplicating core logic.

In practice, this enables a consistent attestation workflow from domain models through to API access and command line tooling. The result is a maintainable foundation for building trust-oriented features where provenance, verification, and lifecycle management need to be handled in a reliable way.

## Packages

- [attestation-models](packages/attestation-models/README.md) - Shared models and data types for attestation connectors and services.
- [attestation-connector-nft](packages/attestation-connector-nft/README.md) - Attestation connector for minting and resolving NFT-backed attestations.
- [attestation-connector-open-attestation](packages/attestation-connector-open-attestation/README.md) - Attestation connector for [OpenAttestation](https://www.openattestation.com/) compatible document workflows.
- [attestation-service](packages/attestation-service/README.md) - Service layer for creating, verifying, transferring, and destroying attestations.
- [attestation-rest-client](packages/attestation-rest-client/README.md) - REST client for calling attestation service endpoints.

## Apps

- [attestation-cli](apps/attestation-cli/README.md) - Command line tool for creating and managing attestations.

## Contributing

To contribute to this package see the guidelines for building and publishing in [CONTRIBUTING](./CONTRIBUTING.md)

## Origin

This repository is derived from the original [iotaledger/twin-attestation](https://github.com/iotaledger/twin-attestation) repository.

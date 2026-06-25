# Attestation Packages

## attestation-models

This package defines shared models, request and response contracts, and data type registrations used by the rest of the repository. It provides a consistent structure for attestation payloads and API interactions, which helps other components integrate with less duplication and fewer mismatched assumptions.

- [README](../packages/attestation-models/README.md)
- [Examples](../packages/attestation-models/docs/examples.md)
- [Changelog](../packages/attestation-models/docs/changelog.md)

## attestation-connector-nft

This package implements attestation operations on top of NFT infrastructure, including creation, verification, transfer, and destruction flows. It acts as the bridge between generic attestation interfaces and token-backed persistence so ownership and lifecycle events can be handled in a single connector.

- [README](../packages/attestation-connector-nft/README.md)
- [Examples](../packages/attestation-connector-nft/docs/examples.md)
- [Changelog](../packages/attestation-connector-nft/docs/changelog.md)

## attestation-connector-open-attestation

This package provides an adapter for OpenAttestation-style workflows so document-centric attestations can be integrated behind the same connector abstraction as other implementations. For background on the ecosystem it targets, see [OpenAttestation](https://www.openattestation.com/).

- [README](../packages/attestation-connector-open-attestation/README.md)
- [Examples](../packages/attestation-connector-open-attestation/docs/examples.md)
- [Changelog](../packages/attestation-connector-open-attestation/docs/changelog.md)

## attestation-service

This package supplies service-level orchestration for attestation operations, selecting connectors and coordinating identity context for create, verify, transfer, and destroy actions. It centralises business flow logic so API and client layers can reuse a consistent behavioural surface.

- [README](../packages/attestation-service/README.md)
- [Examples](../packages/attestation-service/docs/examples.md)
- [Changelog](../packages/attestation-service/docs/changelog.md)

## attestation-rest-client

This package exposes a client for attestation HTTP endpoints, making it straightforward for external services and tools to call attestation operations through a typed interface. It keeps transport concerns in one place and aligns request and response handling with the shared models.

- [README](../packages/attestation-rest-client/README.md)
- [Examples](../packages/attestation-rest-client/docs/examples.md)
- [Changelog](../packages/attestation-rest-client/docs/changelog.md)

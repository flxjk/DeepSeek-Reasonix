# Workflow deep research typespec pipeline specification delta

<!-- DRAFT — generated from the rhex research corpus. Not reviewed, not validated.
     study      : typespec-and-hey-api-gateway
     ssot       : core/workflow/deep-research-typespec-pipeline.tsp (resolves)
     binding    : default — the contract is the corpus default, not a real claim — assign one
     checkedOn  : 2026-10-19 (22 days before 2026-11-10)
     source leaf: docs/rhex/research/typespec-and-hey-api-gateway.md
     invariants : 0 from the .research.tsp contract, 4 derived by a local model
     generated  : 2026-11-10T00:00:00.000Z
     Derived statements carry a quote; contract statements are authoritative.
     Scenarios below are SHAPE ONLY and must be rewritten before this change is applied. -->

## ADDED Requirements

### Requirement: typespec-and-hey-api-gateway-001

The system SHALL satisfy: Emitter implementations must avoid calling Node's node:fs module directly during AST emission.

> Source: "To maintain strict compatibility across Node.js, web browsers, and in-memory compiler test harnesses, emitter implementations must avoid calling Node's node:fs module directly during AST emission, relying instead on emitFile or context.program.host.writeFile with paths constructed via resolvePath and sanitized via sanitizePathSegment6."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: typespec-and-hey-api-gateway-002

The system SHALL satisfy: The gateway exposes a native node:quic HTTP/3 and RFC 9221/9297 datagram server on port 4433.

> Source: "At runtime, it exposes a native node:quic HTTP/3 and RFC 9221/9297 datagram server on port 4433"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: typespec-and-hey-api-gateway-003

The system SHALL satisfy: The gateway exposes a W3C WebTransport server on port 4443.

> Source: "and a W3C WebTransport server (@moq/web-transport) on port 4443"

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

### Requirement: typespec-and-hey-api-gateway-004

The system SHALL satisfy: The maximum frame size must be 1200 bytes to remain safely within standard UDP Path MTU limits.

> Source: "Encoding maxFrameSize (1200 bytes to remain safely within standard UDP Path MTU limits), maxPendingDatagrams, and datagramDropPolicy ('drop-oldest') directly inside TypeSpec @quicDatagram decorators ensures that backpressure and queue-eviction boundaries are enforced inside node:quic's C++ ngtcp2 layer before UDP packet floods can trigger V8 garbage-collection pauses4."

#### Scenario: nominal path
- **WHEN** the system runs with the intended configuration
- **THEN** the constraint holds as stated

#### Scenario: boundary
- **WHEN** the constraint is approached at its stated limit
- **THEN** the system still satisfies it, or fails loudly rather than degrading silently

#### Scenario: adversarial failure recovery
- **WHEN** a malformed input or partial failure would violate the constraint
- **THEN** the violation is detected and reported, and no state is mutated

// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { OpenAttestationConnector } from "../src/openAttestationConnector.js";

describe("OpenAttestationConnector", () => {
	test("can construct", async () => {
		const attestation = new OpenAttestationConnector({});
		expect(attestation).toBeDefined();
	});
});

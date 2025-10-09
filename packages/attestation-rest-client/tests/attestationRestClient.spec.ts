// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { AttestationRestClient } from "../src/attestationRestClient";

describe("AttestationRestClient", () => {
	test("Can create an instance", async () => {
		const client = new AttestationRestClient({ endpoint: "http://localhost:8080" });
		expect(client).toBeDefined();
	});
});

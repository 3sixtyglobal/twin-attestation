# Function: attestationCreate()

> **attestationCreate**(`httpRequestContext`, `componentName`, `request`, `baseRouteName`): `Promise`\<`ICreatedResponse`\>

Attest the data and return the location of the created attestation.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

`IAttestationCreateRequest`

The request.

### baseRouteName

`string`

The base route name for the attestation routes.

## Returns

`Promise`\<`ICreatedResponse`\>

The response object with additional http response properties.

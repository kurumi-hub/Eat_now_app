# Google Maps address setup

The address flow now uses Google Maps instead of Nominatim/OpenStreetMap.

## React dependency

Install the React Google Maps integration used by `GoogleAddressPicker.tsx`:

```bash
npm install @vis.gl/react-google-maps
```

The package owns script loading and React lifecycle through `APIProvider`,
`Map`, `useMap` and `useMapsLibrary`. Do not add a separate Google Maps script
tag or install another loader alongside it.

## Google Cloud APIs

Enable billing and these APIs in the Google Cloud project:

- Maps JavaScript API
- Places API (New)
- Geocoding API

## Environment variables

Add these values to `.env.local` and to the deployment environment:

```env
# Browser key: restrict by HTTP referrer and allow Maps JavaScript API plus
# Places API (New).
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=browser_key_here

# Server key: never prefix with NEXT_PUBLIC. Restrict to Geocoding API and,
# where supported by the deployment, the server's egress IP addresses.
GOOGLE_MAPS_SERVER_API_KEY=server_key_here
```

Do not use the same unrestricted key for browser and server requests.

### Important when configuring Vercel

Create the environment variable as two separate fields:

```text
Name:  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: AIza...your_browser_key...
```

Do not paste `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...` into the **Value** field.
Do not include quotes. Select every Vercel environment that actually serves the
app (Production, Preview and/or Development), then create a new deployment.
`NEXT_PUBLIC_*` values are embedded during the Next.js build; changing the value
without redeploying does not update the browser bundle.

### Browser key restrictions

The browser key must use **Application restrictions -> Websites (HTTP
referrers)**. Add every origin that opens the address dialog, for example:

```text
http://localhost:3000/*
https://your-domain.com/*
https://www.your-domain.com/*
https://your-project.vercel.app/*
https://*.vercel.app/*        # only when Preview deployments must work
```

Under **API restrictions**, allow at least:

- Maps JavaScript API
- Places API (New)

The server key is different: do not give it Website restrictions and do not
expose it with a `NEXT_PUBLIC_` prefix. Restrict that key to Geocoding API and
the deployment's server IP only when a stable egress IP is available.

## When the map shows "didn't load Google Maps correctly"

The production picker uses `@vis.gl/react-google-maps` instead of a custom
script loader. It intentionally does not use a custom Map ID or Advanced
Marker. It renders a fixed pin over the center while the customer drags the map,
matching common food-delivery apps and removing Map ID/cloud-style dependencies.
`APIProvider` loads the Maps JavaScript API once with the quarterly channel and
origin-only referrer authorization.

Use this table when Google reports a configuration error:

| Error code                  | Required fix                                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `RefererNotAllowedMapError` | Add the exact current origin plus `/*` to Website restrictions. Include the Vercel production and preview domains that are used. |
| `ApiNotActivatedMapError`   | Enable Maps JavaScript API in the same project that owns the browser key.                                                        |
| `ApiTargetBlockedMapError`  | Add Maps JavaScript API and Places API (New) to the key's API restrictions.                                                      |
| `BillingNotEnabledMapError` | Link an active billing account to that project.                                                                                  |
| `InvalidKeyMapError`        | Replace the Vercel value with the browser API key only, then redeploy.                                                           |
| `OverQuotaMapError`         | Raise/reset the API quota or remove an overly low daily cap.                                                                     |

After changing Google Cloud restrictions, wait a few minutes, open a new
incognito window and test again so an old Maps script is not reused from the
current tab.

## Database prerequisite

Run `04_finance_tax_fee_upgrade.sql` from the finance migration bundle before
deploying this source. It adds the following `user_addresses` columns used by
the updated server action:

```text
recipient_name
recipient_phone
delivery_note
ward
district
province
```

After file 04, run `06_rpc_api_boundary.sql`, then
`08_google_address_v2.sql`. The updated source does not query
Supabase tables directly; address, cart, restaurant and VNPay data operations
all go through RPC functions. Supabase Auth calls remain in the SDK because
they operate on the Auth service rather than public database tables.

## Behavior

- Step 1 lets the user search with Google Place Autocomplete, use the current
  location, click the map or drag the map beneath the fixed center pin.
- The user confirms the delivery pin before entering any recipient details.
- Step 2 asks only for apartment/floor details, recipient, phone, driver note
  and a familiar label such as Home or Company.
- Administrative fields are extracted and submitted in hidden fields; the
  customer does not have to type ward, district or province.
- The pin stays fixed in the center; clicking or dragging the map changes the
  delivery position.
- Current browser location can be selected with permission.
- Google Place ID, formatted address and latitude/longitude are submitted.
- The server verifies the Place ID again and rejects a client marker
  more than 1.5 km from Google's result. This protects shipping calculations
  against direct client-side coordinate manipulation.
- A confirmed Google location is required before the address can be saved.

## Finance RPC prerequisite

Checkout now calls `preview_order_v2` so payment-method-specific fees are
included in both preview and order placement. This RPC is also added by
`04_finance_tax_fee_upgrade.sql`.

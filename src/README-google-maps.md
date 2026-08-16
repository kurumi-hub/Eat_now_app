# Google Maps address setup

The address flow now uses Google Maps instead of Nominatim/OpenStreetMap.

## Google Cloud APIs

Enable billing and these APIs in the Google Cloud project:

- Maps JavaScript API
- Geocoding API
- Map Management API only when using a custom Map ID

## Environment variables

Add these values to `.env.local` and to the deployment environment:

```env
# Browser key: restrict by HTTP referrer and allow Maps JavaScript API.
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=browser_key_here

# Optional custom Map ID. DEMO_MAP_ID is used when omitted.
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=map_id_here

# Server key: never prefix with NEXT_PUBLIC. Restrict to Geocoding API and,
# where supported by the deployment, the server's egress IP addresses.
GOOGLE_MAPS_SERVER_API_KEY=server_key_here
```

Do not use the same unrestricted key for browser and server requests.

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

After file 04, run `06_rpc_api_boundary.sql`. The updated source does not query
Supabase tables directly; address, cart, restaurant and VNPay data operations
all go through RPC functions. Supabase Auth calls remain in the SDK because
they operate on the Auth service rather than public database tables.

## Behavior

- The user enters the structured address and can locate it on Google Maps.
- The marker can be moved by clicking the map or dragging it.
- Current browser location can be selected with permission.
- Latitude/longitude is submitted with the form.
- The server geocodes the written address again and rejects a client marker
  more than 3 km from Google's result. This protects shipping calculations
  against direct client-side coordinate manipulation.
- If the user does not select a marker, the server uses Google's geocoded
  coordinate for the written address.

## Finance RPC prerequisite

Checkout now calls `preview_order_v2` so payment-method-specific fees are
included in both preview and order placement. This RPC is also added by
`04_finance_tax_fee_upgrade.sql`.

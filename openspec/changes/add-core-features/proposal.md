# Change: Add Core Features

## Why
The current application lacks detailed management for transactions (linking to SKU, suppliers/customers), a comprehensive dashboard, inventory management, and configuration settings.

## What Changes
-   **Database**: New `skus` and `categories` tables; linked to transactions.
-   **Transaction Page**: Enhanced logic for SKUs, validation, and linking to Suppliers/Customers.
-   **Dashboard**: New widgets for top spenders, risk analysis, and SKU performance.
-   **Inventory**: New page to list SKUs.
-   **Settings**: Configuration for baseline values and master data.
-   **UI**: Fixed page title alignment.

## Impact
-   **Safety**: Database changes are additive. Existing functional behavior is preserved via regression testing.
-   **Quality**: Comprehensive automation tests will cover "Human Scenarios" (end-to-end user workflows).
-   **Affected Pages**: `/transactions`, `/`, `/inventory`, `/settings`.

## ADDED Requirements
### Requirement: Transaction Management
The system MUST allow users to record and manage cashflow transactions with strict validation and entity linking.

#### Scenario: SKU Selection and Creation
- **WHEN** the user focuses on the SKU field
- **THEN** a dropdown of existing SKUs SHALL appear
- **AND** if the user types a non-existent SKU, they SHALL be able to add it as a new SKU

#### Scenario: Date Validation
- **WHEN** a transaction has both "Date In" and "Date Out"
- **THEN** "Date Out" MUST NOT be earlier than "Date In"

#### Scenario: Category Selection and Creation
- **WHEN** the user focuses on the Category field
- **THEN** existing categories SHALL be selectable
- **AND** if a non-existent category is entered, the user SHALL be able to add it

#### Scenario: Exclusive Cash Direction
- **WHEN** creating or editing a transaction
- **THEN** the user MUST only be able to enter a value for EITHER "Cash In" OR "Cash Out", not both

#### Scenario: Entity Linking
- **WHEN** "Cash In" is populated
- **THEN** the transaction MUST link to a Customer
- **WHEN** "Cash Out" is populated
- **THEN** the transaction MUST link to a Supplier

## ADDED Requirements
### Requirement: Supplier Insights
The dashboard SHALL provide detailed insights into Supplier-related expenses and risks.

#### Scenario: Top Spender Analysis
- **WHEN** the user views the Supplier section
- **THEN** a widget SHALL display the top suppliers by total transaction value
- **AND** a widget SHALL display the top suppliers by transaction frequency

#### Scenario: Risk Analysis
- **WHEN** the user views the Supplier section
- **THEN** a widget SHALL display the top 5 riskiest suppliers based on their risk score and the sum of total pending value

### Requirement: Customer Insights
The dashboard SHALL provide detailed insights into Customer-related income and risks.

#### Scenario: Top Spender Analysis
- **WHEN** the user views the Customer section
- **THEN** a widget SHALL display the top customers by total transaction value
- **AND** a widget SHALL display the top customers by transaction frequency

#### Scenario: Risk Analysis
- **WHEN** the user views the Customer section
- **THEN** a widget SHALL display the top 5 riskiest customers based on their risk score and the sum of total pending value

### Requirement: SKU Insights
The dashboard SHALL provide insights into SKU performance.

#### Scenario: Top SKU Metrics
- **WHEN** the user views the SKU section
- **THEN** the system SHALL display the Top 5 SKUs by value
- **AND** it SHALL include the transaction frequency and total value for each

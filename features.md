# CashPolit

## Description
An AI-powered cashflow dashboard that helps you plan and manage your organization's financial foundation, giving you the clarity to move forward with confidence.

## Features

- Dashboard Page
This dashboard provides a comprehensive overview of your organization's financial health, including key metrics such as revenue, expenses, and cash flow. Also, it shows the predicted cashflow based on your organization's financial history. Moreover, it shows cashflow by category, helping you identify areas where you can cut costs and improve your cashflow.

- Transaction Page
This feature allows you to add, and cancel transactions. It also provides a search function to find specific transactions. Each transaction has a SKU, Category, Amount, and Purchase Date, Payment Due Date, Supplier or Customer information. The category is used to group transactions and calculate the total amount for each category. This feature have a hidden calulation based on transaction frequency to predict if this product is a fast moving or slow moving product. That indicator is used to calculate the predicted cashflow. This transaction can link to supplier and Customer to understand the payment terms and payment history.

- Supplier Page
This feature allows you to add, edit suppliers. It also provides a search function to find specific suppliers. Each supplier has a name, phone, and address. The name is used to group suppliers and calculate the total amount for each supplier. This feature have a hidden logic to calculate the supplier score based on payment terms, promotion, and payment history.

- Customer Page
This feature allows you to add, edit customers. It also provides a search function to find specific customers. Each customer has a name, phone, and address. The name is used to group customers and calculate the total amount for each customer. We have a hidden to calculate the customer score based on payment terms, payment history, payment amount, payment delay, and payment frequency.


## Tech Stack
Frontend
- React
Backend
- Node.JS
- ElysiaJS
- ExpressJS
- Supabase

## License
MIT
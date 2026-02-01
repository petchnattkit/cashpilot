import { InsightWidget } from './components/InsightWidget'

export function EntityWidgets({ insights }: { insights: ReturnType<typeof import('../../../hooks/useDashboardInsights').useDashboardInsights> }) {
    if (!insights) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Suppliers */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Supplier Insights</h3>
                <InsightWidget
                    title="Top Spenders (By Value)"
                    data={insights.topSuppliersByValue}
                    type="value"
                    color="error" // Cash Out
                />
                <InsightWidget
                    title="Most Frequent Suppliers"
                    data={insights.topSuppliersByFreq}
                    type="count"
                />
                <InsightWidget
                    title="High Risk Suppliers (Pending)"
                    data={insights.riskSuppliers}
                    type="risk"
                    color="warning"
                />
            </div>

            {/* Customers */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Customer Insights</h3>
                <InsightWidget
                    title="Top Customers (By Value)"
                    data={insights.topCustomersByValue}
                    type="value"
                    color="success" // Cash In
                />
                <InsightWidget
                    title="Most Frequent Customers"
                    data={insights.topCustomersByFreq}
                    type="count"
                />
                <InsightWidget
                    title="Risk Customers (Pending Income)"
                    data={insights.riskCustomers}
                    type="risk"
                    color="warning"
                />
            </div>

            {/* SKUs */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-900">Product Insights</h3>
                <InsightWidget
                    title="Top Products (By Value)"
                    data={insights.topSkusByValue}
                    type="value"
                />
                <InsightWidget
                    title="Most Frequent Products"
                    data={insights.topSkusByFreq}
                    type="count"
                />
            </div>
        </div>
    );
}

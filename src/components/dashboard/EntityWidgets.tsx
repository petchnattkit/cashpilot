import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

type EntityStat = {
    id: string;
    name: string;
    value?: number;
    count?: number;
    pendingValue?: number;
};

interface WidgetProps {
    title: string;
    data: EntityStat[];
    type: 'value' | 'count' | 'risk';
    emptyMessage?: string;
    color?: 'primary' | 'success' | 'error' | 'warning';
}

function InsightWidget({ title, data, type, emptyMessage = 'No data available', color = 'primary' }: WidgetProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <p className="text-sm text-neutral-400 italic">{emptyMessage}</p>
                ) : (
                    <ul className="space-y-2">
                        {data.map((item, idx) => (
                            <li key={item.id} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-neutral-400 font-mono text-xs w-4">{idx + 1}</span>
                                    <span className="font-medium truncate max-w-[120px]" title={item.name}>{item.name}</span>
                                </div>
                                <span className={`font-semibold ${color === 'error' ? 'text-error' :
                                    color === 'success' ? 'text-success' : 'text-neutral-900'
                                    }`}>
                                    {type === 'value' && item.value !== undefined ? formatCurrency(item.value) :
                                        type === 'risk' && item.pendingValue !== undefined ? formatCurrency(item.pendingValue) :
                                            type === 'count' && item.count !== undefined ? `${item.count} txns` : '-'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

export function EntityWidgets({ insights }: { insights: ReturnType<typeof import('../../hooks/useDashboardInsights').useDashboardInsights> }) {
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

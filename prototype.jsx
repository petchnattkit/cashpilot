import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, Plus, DollarSign, AlertCircle, TrendingUp, Activity, FileText, Copy, Shield, UploadCloud, CheckSquare, X, Loader2, Settings, MessageSquare, Send, Filter, Truck, User, RefreshCw, ArrowRight, Package, Database, BarChart3 } from 'lucide-react';

// --- CONFIGURATION TAB COMPONENT ---
const ConfigTab = ({ initialBalance, setInitialBalance, minimumBalance, setMinimumBalance, thresholdDays, setThresholdDays, suppliers, customers }) => (
    <div className="bg-white rounded-lg shadow p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center border-b pb-4">
            <Settings className="w-6 h-6 mr-3 text-gray-600" /> System Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h3 className="font-bold text-gray-700 text-lg">Liquidity Thresholds</h3>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Starting Cash Position</label>
                        <div className="flex items-center">
                            <span className="bg-white border border-r-0 rounded-l-md px-3 py-2 text-gray-500 font-mono">$</span>
                            <input
                                type="number"
                                value={initialBalance}
                                onChange={e => setInitialBalance(Number(e.target.value))}
                                className="w-full border rounded-r-md px-3 py-2 focus:ring-2 focus:ring-blue-200 outline-none font-semibold text-blue-700"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Minimum Safety Balance</label>
                        <div className="flex items-center">
                            <span className="bg-white border border-r-0 rounded-l-md px-3 py-2 text-gray-500 font-mono">$</span>
                            <input
                                type="number"
                                value={minimumBalance}
                                onChange={e => setMinimumBalance(Number(e.target.value))}
                                className="w-full border rounded-r-md px-3 py-2 focus:ring-2 focus:ring-red-200 outline-none font-semibold text-red-700"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Alerts trigger when Net Liquidity drops below this value.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="font-bold text-gray-700 text-lg">Risk & Payment Rules</h3>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">High Risk Threshold (Days)</label>
                        <input
                            type="number"
                            value={thresholdDays}
                            onChange={e => setThresholdDays(Number(e.target.value))}
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                    <div className="pt-2">
                        <div className="text-sm font-semibold text-gray-600 mb-2">Active Entities</div>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">{suppliers.length} Suppliers</div>
                            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">{customers.length} Customers</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- REUSABLE DATA TAB COMPONENT ---
const DataTab = ({
    title,
    type,
    icon: Icon,
    colorClass,
    btnClass,
    tableContent,
    logicConfig,
    rowCount,
    files,
    onAddFile,
    onRemoveFile,
    onFileSelect,
    onDescriptionChange,
    analysisId,
    setAnalysisId,
    onAnalyze,
    isAnalyzing
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[800px]">
            {/* LEFT: FILE MANAGER (4 Cols) */}
            <div className="lg:col-span-4 bg-white rounded-lg shadow border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-white">
                    <h3 className="font-bold text-gray-800 flex items-center"><UploadCloud className="w-5 h-5 mr-2 text-blue-600" /> Data Sources & Evidence</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {files.map((file) => (
                        <div key={file.id} className="bg-white p-3 rounded border border-gray-300 shadow-sm relative">
                            <button onClick={() => onRemoveFile(type, file.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                            {file.status === 'pending' ? (
                                <div className="space-y-3 pr-6">
                                    <input
                                        type="text"
                                        placeholder="Document Description"
                                        className="w-full text-sm p-2 border rounded focus:outline-blue-500 focus:ring-1 focus:ring-blue-200"
                                        value={file.description}
                                        onChange={(e) => onDescriptionChange(type, file.id, e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex items-center">
                                        <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 text-xs font-bold py-1.5 px-3 rounded hover:bg-gray-50 transition-colors shadow-sm">
                                            Choose File
                                            <input type="file" className="hidden" onChange={(e) => onFileSelect(type, file.id, e.target.files[0])} />
                                        </label>
                                        <span className="ml-3 text-xs text-gray-400 italic">No file chosen</span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center mb-2">
                                        <div className={`p-1.5 rounded mr-2 ${file.status === 'processed' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-500'}`}>
                                            {file.status === 'processed' ? <CheckSquare className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-800 truncate">{file.description || "Untitled Document"}</div>
                                            <div className="text-xs text-gray-500 truncate">{file.name}</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                        <div className={`h-1.5 rounded-full transition-all duration-300 ${file.status === 'processed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${file.progress}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <button onClick={() => onAddFile(type)} className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors mt-2">
                        <Plus className="w-4 h-4 mr-1" /> Add Source
                    </button>
                </div>

                {/* NEW: RISK ANALYSIS INPUT BLOCK */}
                {type.startsWith('customer') || type.startsWith('supplier') ? (
                    <div className="p-4 border-t bg-gray-50 space-y-3">
                        <div className="text-xs font-bold text-gray-500 uppercase flex items-center">
                            <Shield className="w-3 h-3 mr-1" /> Analysis Target
                        </div>
                        <input
                            type="text"
                            placeholder={type === 'customer' ? "Enter Customer ID (e.g., CUST-009)" : "Enter Supplier ID (e.g., SUP-009)"}
                            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white shadow-sm"
                            value={analysisId}
                            onChange={(e) => setAnalysisId(e.target.value)}
                        />
                        <button
                            onClick={onAnalyze}
                            disabled={isAnalyzing || !analysisId}
                            className={`w-full py-2.5 rounded-md text-sm font-bold text-white flex items-center justify-center transition-all ${isAnalyzing || !analysisId ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5'}`}
                        >
                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                            {isAnalyzing ? 'Processing Sources...' : 'Analyze Evidence'}
                        </button>
                        <p className="text-[10px] text-center text-gray-400">
                            Simulates sending {files.length} sources to backend for extraction.
                        </p>
                    </div>
                ) : null}
            </div>

            {/* RIGHT: DATA PREVIEW */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                {logicConfig && (
                    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${colorClass}`}>
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center"><Icon className={`w-5 h-5 mr-2 ${btnClass}`} /> Logic & Rules</h2>
                                </div>
                                {logicConfig}
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-white rounded-lg shadow flex-1 flex flex-col overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 text-sm flex items-center"><FileText className="w-4 h-4 mr-2" /> Editable Data Ledger</h3>
                        <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500">Count: {rowCount}</span>
                    </div>
                    <div className="flex-1 overflow-auto">{tableContent}</div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [initialBalance, setInitialBalance] = useState(40000);
    const [minimumBalance, setMinimumBalance] = useState(10000);
    const [thresholdDays, setThresholdDays] = useState(30);
    const [activeTab, setActiveTab] = useState('health');

    // --- SUB-TAB STATES ---
    const [customerSubTab, setCustomerSubTab] = useState('score');
    const [supplierSubTab, setSupplierSubTab] = useState('score');

    // --- LOGIC CONFIG STATES ---
    const [riskThreshold, setRiskThreshold] = useState(50);
    const [expenseKeywords, setExpenseKeywords] = useState('EXP, Rent, Bill, Lease, Server');
    const [liquidityRule, setLiquidityRule] = useState('standard');

    // --- ANALYSIS STATES ---
    const [analysisId, setAnalysisId] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // --- CHART FILTER STATE ---
    const [chartRange, setChartRange] = useState(90);
    const [customEndDate, setCustomEndDate] = useState('');

    // --- FILE STATE ---
    const [files, setFiles] = useState({
        product: [],
        customer: [],
        supplier: []
    });

    // --- NEW: EDITABLE EXTRACTED DATA STATES ---
    const [customerExtractedData, setCustomerExtractedData] = useState([
        { id: 1, entity_id: 'CUST-Fast', name: 'Client A', totalAr: 30000, avgDaysToPay: 20 },
        { id: 2, entity_id: 'CUST-Slow', name: 'Client B', totalAr: 25000, avgDaysToPay: 55 }
    ]);

    const [supplierExtractedData, setSupplierExtractedData] = useState([
        { id: 1, entity_id: 'SUP-Gen', name: 'Acme Corp', category: 'Raw Materials', annualSpend: 120000, payables: 10500, paymentTerms: 30 },
        { id: 2, entity_id: 'SUP-Strict', name: 'Globex Inc', category: 'Logistics', annualSpend: 50000, payables: 4200, paymentTerms: 45 }
    ]);

    // Reset analysis input on tab switch
    useEffect(() => {
        setAnalysisId('');
        setIsAnalyzing(false);
    }, [activeTab]);

    // --- DATA STATE ---
    const [suppliers, setSuppliers] = useState([
        { supplier_id: 'SUP-Strict', terms: 'Strict (Pay Fast)', dpo: 15, riskScore: 10 },
        { supplier_id: 'SUP-Gen', terms: 'Generous (Pay Later)', dpo: 60, riskScore: 5 },
        { supplier_id: 'UTIL-Elec', terms: 'Utility', dpo: 0, riskScore: 0 },
        { supplier_id: 'UTIL-Rent', terms: 'Utility', dpo: 0, riskScore: 0 }
    ]);

    const [customers, setCustomers] = useState([
        { customer_id: 'CUST-Fast', terms: 'Good Payer', dso: 10, riskScore: 5 },
        { customer_id: 'CUST-Slow', terms: 'Bad Payer', dso: 60, riskScore: 55 },
        { customer_id: 'N/A', terms: 'No Customer (Expense)', dso: 0, riskScore: 0 }
    ]);

    const [skus, setSkus] = useState([
        { sku_id: 'SKU-Fast', speed: 'High Demand', dio: 15 },
        { sku_id: 'SKU-Dead', speed: 'Dead Stock', dio: 180 },
        { sku_id: 'EXP', speed: 'Operating Expense', dio: 0 }
    ]);

    const [transactions, setTransactions] = useState([
        { id: 'SKU-01', date: '2025-01-01', dateOut: '2025-01-15', cashOut: 10000, cashIn: 10000, supplier: 'SUP-Gen', sku: 'SKU-Fast', customer: 'CUST-Fast', label: 'Cash King', active: true },
        { id: 'SKU-02', date: '2025-01-02', dateOut: '2025-01-17', cashOut: 10000, cashIn: 10000, supplier: 'SUP-Strict', sku: 'SKU-Fast', customer: 'CUST-Fast', label: 'Cash King (Tight)', active: true },
        { id: 'SKU-03', date: '2025-01-04', dateOut: '2025-03-01', cashOut: 10000, cashIn: 10000, supplier: 'SUP-Gen', sku: 'SKU-Fast', customer: 'CUST-Slow', label: 'Trap', active: true },
        { id: 'SKU-09', date: '2025-01-13', dateOut: '2025-01-20', cashOut: 50000, cashIn: 55000, supplier: 'SUP-Gen', sku: 'SKU-Fast', customer: 'CUST-Fast', label: 'Cash King', active: true },
        { id: 'SKU-17', date: '2025-01-25', dateOut: '', cashOut: 2500, cashIn: 0, supplier: 'UTIL-Elec', sku: 'EXP', customer: 'N/A', label: 'Electricity Bill', active: true },
        { id: 'SKU-18', date: '2025-01-26', dateOut: '', cashOut: 8000, cashIn: 0, supplier: 'UTIL-Rent', sku: 'EXP', customer: 'N/A', label: 'Office Rent', active: true }
    ]);

    const [newTransaction, setNewTransaction] = useState({
        id: '', date: '2025-01-28', dateOut: '', cashOut: '', cashIn: '', supplier: '', sku: '', customer: '', label: ''
    });

    // --- NEW STATES FOR RISK ADD FORMS ---
    const [newCustomerEntry, setNewCustomerEntry] = useState({ customer_id: '', terms: '', riskScore: '' });
    const [newSupplierEntry, setNewSupplierEntry] = useState({ supplier_id: '', terms: '', riskScore: '' });

    useEffect(() => { setNewTransaction(prev => ({ ...prev, id: `SKU-${transactions.length + 1}` })); }, [transactions.length]);

    // --- CRUD OPERATIONS ---
    const handleUpdateTransaction = (index, field, value) => {
        const newTransactions = [...transactions];
        newTransactions[index] = { ...newTransactions[index], [field]: value };
        if (field === 'cashIn' || field === 'cashOut') newTransactions[index][field] = parseFloat(value) || 0;
        setTransactions(newTransactions);
    };

    const handleToggleActive = (index) => {
        const newTransactions = [...transactions];
        newTransactions[index].active = !newTransactions[index].active;
        setTransactions(newTransactions);
    }

    const handleDeleteTransaction = (index) => setTransactions(transactions.filter((_, i) => i !== index));

    const handleAddManualTransaction = () => {
        if (newTransaction.id) {
            setTransactions([...transactions, { ...newTransaction, cashOut: parseFloat(newTransaction.cashOut) || 0, cashIn: parseFloat(newTransaction.cashIn) || 0, active: true }]);
            setNewTransaction({ id: `SKU-${transactions.length + 2}`, date: newTransaction.date, dateOut: '', cashOut: '', cashIn: '', supplier: '', sku: '', customer: '', label: '' });
        }
    };

    const handleUpdateCustomer = (index, field, value) => {
        const newCustomers = [...customers];
        newCustomers[index] = { ...newCustomers[index], [field]: value };
        if (field === 'riskScore') newCustomers[index][field] = parseInt(value) || 0;
        setCustomers(newCustomers);
    };
    const handleDeleteCustomer = (index) => setCustomers(customers.filter((_, i) => i !== index));

    const handleAddManualCustomer = () => {
        if (newCustomerEntry.customer_id) {
            setCustomers([...customers, {
                customer_id: newCustomerEntry.customer_id,
                terms: newCustomerEntry.terms || 'Net 30',
                dso: 30, // Default
                riskScore: parseInt(newCustomerEntry.riskScore) || 0
            }]);
            setNewCustomerEntry({ customer_id: '', terms: '', riskScore: '' });
        }
    };

    const handleUpdateSupplier = (index, field, value) => {
        const newSuppliers = [...suppliers];
        newSuppliers[index] = { ...newSuppliers[index], [field]: value };
        if (field === 'riskScore') newSuppliers[index][field] = parseInt(value) || 0;
        setSuppliers(newSuppliers);
    };
    const handleDeleteSupplier = (index) => setSuppliers(suppliers.filter((_, i) => i !== index));

    const handleAddManualSupplier = () => {
        if (newSupplierEntry.supplier_id) {
            setSuppliers([...suppliers, {
                supplier_id: newSupplierEntry.supplier_id,
                terms: newSupplierEntry.terms || 'Net 30',
                dpo: 30, // Default
                riskScore: parseInt(newSupplierEntry.riskScore) || 0
            }]);
            setNewSupplierEntry({ supplier_id: '', terms: '', riskScore: '' });
        }
    };

    // --- HANDLERS FOR EXTRACTED DATA CRUD ---
    const handleUpdateCustomerExtractedData = (index, field, value) => {
        const newData = [...customerExtractedData];
        newData[index] = { ...newData[index], [field]: value };
        setCustomerExtractedData(newData);
    };

    const handleUpdateSupplierExtractedData = (index, field, value) => {
        const newData = [...supplierExtractedData];
        newData[index] = { ...newData[index], [field]: value };
        setSupplierExtractedData(newData);
    };

    const handleAddExtractedCustomerRow = () => {
        const newId = customerExtractedData.length > 0 ? Math.max(...customerExtractedData.map(d => d.id)) + 1 : 1;
        setCustomerExtractedData([...customerExtractedData, { id: newId, entity_id: '', name: 'New Client', totalAr: 0, avgDaysToPay: 0 }]);
    };

    const handleDeleteExtractedCustomerRow = (id) => {
        setCustomerExtractedData(customerExtractedData.filter(d => d.id !== id));
    };

    const handleAddExtractedSupplierRow = () => {
        const newId = supplierExtractedData.length > 0 ? Math.max(...supplierExtractedData.map(d => d.id)) + 1 : 1;
        setSupplierExtractedData([...supplierExtractedData, { id: newId, entity_id: '', name: 'New Supplier', category: 'General', annualSpend: 0, payables: 0, paymentTerms: 0 }]);
    };

    const handleDeleteExtractedSupplierRow = (id) => {
        setSupplierExtractedData(supplierExtractedData.filter(d => d.id !== id));
    };

    // --- FILE HANDLING ---
    const handleAddFile = (type) => {
        const newFileId = Date.now();
        setFiles(prev => ({ ...prev, [type]: [...prev[type], { id: newFileId, name: '', description: '', status: 'pending', progress: 0 }] }));
    };
    const handleRemoveFile = (type, fileId) => setFiles(prev => ({ ...prev, [type]: prev[type].filter(f => f.id !== fileId) }));
    const handleDescriptionChange = (type, fileId, value) => setFiles(prev => ({ ...prev, [type]: prev[type].map(f => f.id === fileId ? { ...f, description: value } : f) }));
    const handleFileSelect = (type, fileId, fileObj) => {
        if (!fileObj) return;
        setFiles(prev => ({ ...prev, [type]: prev[type].map(f => f.id === fileId ? { ...f, name: fileObj.name, status: 'uploading' } : f) }));
        simulateUpload(type, fileId);
    };
    const simulateUpload = (type, fileId) => {
        const interval = setInterval(() => {
            setFiles(prev => {
                const fileList = [...prev[type]];
                const idx = fileList.findIndex(f => f.id === fileId);
                if (idx === -1) { clearInterval(interval); return prev; }
                if (fileList[idx].progress >= 100) {
                    clearInterval(interval);
                    fileList[idx].status = 'processed';

                    // ONLY automatically ingest for product
                    if (type === 'product') {
                        ingestMockData(type, fileId);
                    }

                    return { ...prev, [type]: fileList };
                }
                fileList[idx].progress += 10;
                return { ...prev, [type]: fileList };
            });
        }, 200);
    };

    const handleAnalyze = (type) => {
        if (!analysisId) return;
        setIsAnalyzing(true);

        // Simulate API delay & logic to add to BOTH tables
        setTimeout(() => {
            const randomScore = Math.floor(Math.random() * 100);

            if (type === 'customer') {
                // 1. Add to Risk Score Table
                setCustomers(prev => [...prev, {
                    customer_id: analysisId,
                    terms: randomScore > 50 ? 'Net 15' : 'Net 60',
                    dso: randomScore > 50 ? 20 : 65,
                    riskScore: randomScore
                }]);

                // 2. Add to Extracted Data Table (Syncs with Risk Score ID)
                setCustomerExtractedData(prev => [...prev, {
                    id: Date.now(),
                    entity_id: analysisId,
                    name: `Client ${analysisId.split('-')[1] || 'New'}`,
                    totalAr: Math.floor(Math.random() * 50000) + 5000,
                    avgDaysToPay: randomScore > 50 ? 20 : 65
                }]);

            } else if (type === 'supplier') {
                // 1. Add to Risk Score Table
                setSuppliers(prev => [...prev, {
                    supplier_id: analysisId,
                    terms: randomScore > 50 ? 'Net 30' : 'Net 60',
                    dpo: randomScore > 50 ? 30 : 60,
                    riskScore: randomScore
                }]);

                // 2. Add to Extracted Data Table (Syncs with Risk Score ID)
                setSupplierExtractedData(prev => [...prev, {
                    id: Date.now(),
                    entity_id: analysisId,
                    name: `Supplier ${analysisId.split('-')[1] || 'New'}`,
                    category: 'General',
                    annualSpend: Math.floor(Math.random() * 100000) + 10000,
                    payables: Math.floor(Math.random() * 5000) + 500,
                    paymentTerms: randomScore > 50 ? 30 : 60
                }]);
            }

            setIsAnalyzing(false);
            setAnalysisId(''); // Clear input
        }, 1500);
    };

    const ingestMockData = (type, fileId) => {
        if (type === 'product') {
            setTransactions(prev => [...prev,
            { id: `IMP-${fileId}-1`, date: '2025-02-05', dateOut: '2025-02-25', cashOut: 0, cashIn: 5000, supplier: 'SUP-Gen', sku: 'SKU-Fast', customer: 'CUST-Fast', label: `Sales (File ${fileId})`, active: true },
            { id: `IMP-${fileId}-2`, date: '2025-02-01', dateOut: '', cashOut: 2000, cashIn: 0, supplier: 'UTIL-Rent', sku: 'EXP', customer: 'N/A', label: `Rent (File ${fileId})`, active: true }
            ]);
        }
    };

    // --- ANALYSIS ---
    const analyzeSingle = (txn) => {
        if (!txn || typeof txn !== 'object') return null;
        const sup = suppliers.find(s => s.supplier_id === txn.supplier) || suppliers[0];
        const cust = customers.find(c => c.customer_id === txn.customer) || customers[0];
        const sku = skus.find(sk => sk.sku_id === txn.sku) || skus[0];

        // Date In (Purchase/Acquisition)
        const dateIn = new Date(txn.date);
        if (isNaN(dateIn.getTime())) return null;

        // Cash Out triggers based on Supplier terms
        const outDate = new Date(dateIn); outDate.setDate(dateIn.getDate() + (sup?.dpo || 0));

        // Date Out (Sale/Depletion)
        let inDate = new Date(dateIn);
        if (txn.dateOut && txn.dateOut !== '') {
            // If explicit Date Out provided, use it + DSO for cash inflow
            const saleDate = new Date(txn.dateOut);
            if (!isNaN(saleDate.getTime())) {
                inDate = new Date(saleDate);
                inDate.setDate(saleDate.getDate() + (cust?.dso || 0));
            }
        } else {
            // Fallback to DIO logic if no explicit Date Out
            inDate.setDate(dateIn.getDate() + (sku?.dio || 0) + (cust?.dso || 0));
        }

        return { ...txn, cashOutDateObj: outDate, cashInDateObj: inDate };
    };

    const graphData = useMemo(() => {
        const validTxns = transactions.filter(t => t.active && t.date && !isNaN(new Date(t.date).getTime()));
        const events = [{ date: new Date('2025-01-01'), amount: 0, type: 'start' }];

        validTxns.forEach(txn => {
            const analysis = analyzeSingle(txn);
            if (analysis) {
                if (txn.cashOut > 0) events.push({ date: analysis.cashOutDateObj, amount: -txn.cashOut, type: 'out', id: txn.id });
                if (txn.cashIn > 0) events.push({ date: analysis.cashInDateObj, amount: txn.cashIn, type: 'in', id: txn.id });
            }
        });

        events.sort((a, b) => a.date - b.date);

        let balance = initialBalance;
        const fullData = events.map(e => {
            if (e.type !== 'start') balance += e.amount;
            return { date: e.date, balance };
        });

        const startDate = fullData[0]?.date || new Date();
        let cutoffDate = new Date(startDate);
        if (chartRange === 'custom' && customEndDate) cutoffDate = new Date(customEndDate);
        else cutoffDate.setDate(startDate.getDate() + parseInt(chartRange));

        return fullData.filter(d => d.date <= cutoffDate);
    }, [transactions, initialBalance, suppliers, customers, skus, chartRange, customEndDate]);

    const financialMetrics = useMemo(() => {
        let riskAdjustedInflow = 0, lockedFixedExpenses = 0, atRiskAR = 0, totalInflow = 0, totalOutflow = 0;

        transactions.filter(t => t.active).forEach(t => {
            const cust = customers.find(c => c.customer_id === t.customer);
            const riskScore = cust?.riskScore || 0;
            const isFixed = t.sku === 'EXP' || expenseKeywords.split(',').some(k => t.label.toLowerCase().includes(k.trim().toLowerCase()));

            if (t.cashIn > 0) {
                totalInflow += t.cashIn;
                riskAdjustedInflow += t.cashIn * (1 - (riskScore / 100));
                if (riskScore > riskThreshold) atRiskAR += t.cashIn;
            }
            if (t.cashOut > 0) {
                totalOutflow += t.cashOut;
                if (isFixed) lockedFixedExpenses += t.cashOut;
            }
        });

        // CORRECTED FORMULA: We no longer subtract 'atRiskAR' to avoid double counting. 
        // Risk is already handled by 'riskAdjustedInflow'.
        const netLiquidity = (initialBalance + riskAdjustedInflow) - lockedFixedExpenses;

        const runwayMonths = netLiquidity / Math.max(lockedFixedExpenses, 1000);
        const riskAdjustedInflowVal = riskAdjustedInflow; // For exporting the variable

        // Calculate Averages for SME Metrics
        const avgDSO = customers.reduce((sum, c) => sum + (c.dso || 0), 0) / (customers.length || 1);
        const avgDPO = suppliers.reduce((sum, s) => sum + (s.dpo || 0), 0) / (suppliers.length || 1);
        const avgDIO = skus.reduce((sum, s) => sum + (s.dio || 0), 0) / (skus.length || 1);
        const cashConversionCycle = avgDSO + avgDIO - avgDPO;

        return {
            netLiquidity,
            runwayMonths,
            atRiskAR,
            lockedFixedExpenses,
            totalInflow,
            totalOutflow,
            riskAdjustedInflowVal,
            avgDSO,
            avgDPO,
            avgDIO,
            cashConversionCycle
        };
    }, [initialBalance, transactions, customers, suppliers, skus, riskThreshold, expenseKeywords]);

    // --- RENDERERS ---
    const renderStepChart = () => {
        if (!graphData.length) return null;
        const width = 1000, height = 300, padding = 60;
        const balances = graphData.map(d => d.balance);
        const minBal = Math.min(0, ...balances), maxBal = Math.max(initialBalance, ...balances);
        const range = maxBal - minBal || 1;
        const minTime = graphData[0].date.getTime(), maxTime = graphData[graphData.length - 1].date.getTime();
        const timeRange = maxTime - minTime || 1;

        const getX = d => padding + ((d.getTime() - minTime) / timeRange) * (width - padding * 2);
        const getY = b => padding + (1 - (b - minBal) / range) * (height - padding * 2);

        let pathD = `M ${getX(graphData[0].date)} ${getY(graphData[0].balance)}`;
        for (let i = 1; i < graphData.length; i++) pathD += ` L ${getX(graphData[i].date)} ${getY(graphData[i - 1].balance)} L ${getX(graphData[i].date)} ${getY(graphData[i].balance)}`;

        const yTicks = [0, 0.5, 1].map(r => Math.round(maxBal - range * r));
        const xLabels = graphData.filter((_, i) => i % Math.max(1, Math.floor(graphData.length / 6)) === 0);

        return (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 flex items-center"><Activity className="w-5 h-5 mr-2" /> Projected Cash Balance</h3>
                    <div className="flex items-center gap-2 text-sm bg-gray-100 p-1 rounded-lg">
                        <Filter className="w-4 h-4 text-gray-500 ml-2 mr-1" />
                        {[30, 60, 90].map(d => (
                            <button key={d} onClick={() => { setChartRange(d); setCustomEndDate('') }} className={`px-3 py-1 rounded ${chartRange === d ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}>{d}d</button>
                        ))}
                        <input type="date" value={customEndDate} onChange={e => { setCustomEndDate(e.target.value); setChartRange('custom') }} className="bg-transparent border-none text-xs w-24" />
                    </div>
                </div>
                <svg width={width} height={height} className="overflow-visible">
                    <line x1={padding} y1={getY(minimumBalance)} x2={width - padding} y2={getY(minimumBalance)} stroke="#ef4444" strokeDasharray="5,5" />
                    <text x={width - padding + 5} y={getY(minimumBalance)} className="text-xs fill-red-500">Min: ${minimumBalance}</text>
                    <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2" />
                    {yTicks.map((t, i) => <text key={i} x={padding - 10} y={getY(t)} textAnchor="end" className="text-xs fill-gray-400">${t.toLocaleString()}</text>)}
                    {xLabels.map((d, i) => <text key={i} x={getX(d.date)} y={height - 10} textAnchor="middle" className="text-xs fill-gray-400">{d.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</text>)}
                </svg>
            </div>
        );
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* NET LIQUIDITY */}
                <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="text-xs opacity-75 uppercase font-bold mb-1">Net Liquidity</div>
                    <div className="text-3xl font-bold">${financialMetrics.netLiquidity.toLocaleString()}</div>
                    <div className="text-xs opacity-75 mt-2 border-t border-blue-500 pt-2">Risk-Adjusted Cash - Fixed Burn</div>
                </div>

                {/* BREAKDOWN CARD 1: Starting Balance */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">A. Starting Balance</div>
                    <div className="text-3xl font-bold text-gray-700">${initialBalance.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-2">Cash on hand (Today)</div>
                </div>

                {/* BREAKDOWN CARD 2: Inflow */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">B. Risk-Adjusted Inflow</div>
                    <div className="text-3xl font-bold text-green-600">+${financialMetrics.riskAdjustedInflowVal.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-2">Discounted by customer risk</div>
                </div>

                {/* RUNWAY */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Runway</div>
                    <div className="text-3xl font-bold text-gray-800">{financialMetrics.runwayMonths.toFixed(1)} <span className="text-sm font-normal text-gray-400">mo</span></div>
                    <div className="text-xs text-gray-400 mt-2">Calc: Net Liquidity / Total Burn</div>
                </div>

                {/* AT-RISK AR */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">At-Risk AR (Exposure)</div>
                    <div className="text-3xl font-bold text-orange-600">${financialMetrics.atRiskAR.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-2">High risk receivables monitored</div>
                </div>

                {/* TOTAL BURN */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Total Burn</div>
                    <div className="text-3xl font-bold text-red-600">${financialMetrics.lockedFixedExpenses.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-2">This represents your "Locked Fixed Expenses."</div>
                </div>

                {/* CCC METRIC - New for SME */}
                <div className="bg-indigo-50 p-6 rounded-lg shadow border border-indigo-200 col-span-2 md:col-span-1">
                    <div className="text-xs text-indigo-800 uppercase font-bold mb-1">Cash Conversion Cycle</div>
                    <div className="text-3xl font-bold text-indigo-900">{financialMetrics.cashConversionCycle.toFixed(0)} <span className="text-sm font-normal text-indigo-400">days</span></div>
                    <div className="text-xs text-indigo-400 mt-2">Time to convert inventory to cash.</div>
                </div>

                {/* Efficiency Metrics Group */}
                <div className="bg-gray-50 p-6 rounded-lg shadow border border-gray-200 col-span-2 md:col-span-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 font-bold uppercase">Avg DSO (Collect)</span>
                        <span className="font-bold text-green-700">{financialMetrics.avgDSO.toFixed(0)} days</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mb-4"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, financialMetrics.avgDSO)}%` }}></div></div>

                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 font-bold uppercase">Avg DPO (Pay)</span>
                        <span className="font-bold text-red-700">{financialMetrics.avgDPO.toFixed(0)} days</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full"><div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, financialMetrics.avgDPO)}%` }}></div></div>
                </div>
            </div>

            {renderStepChart()}
            {/* Mock Chatbot Below Chart */}
            <div className="bg-white rounded-lg shadow border border-gray-200 h-64 flex flex-col">
                <div className="p-3 bg-indigo-50 border-b flex justify-between items-center rounded-t-lg">
                    <span className="font-bold text-indigo-900 flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Financial Assistant</span>
                    <span className="text-xs bg-white px-2 py-1 rounded text-indigo-600 border">AI Powered</span>
                </div>
                <div className="flex-1 p-4 bg-gray-50 text-sm text-gray-600 italic flex items-center justify-center">
                    "Based on your data, your lowest projected cash point is ${Math.min(...graphData.map(d => d.balance)).toLocaleString()} in {chartRange} days. Consider delaying payments to 'SUP-Gen' to improve liquidity."
                </div>
                <div className="p-3 border-t bg-white rounded-b-lg flex">
                    <input className="flex-1 bg-gray-100 rounded-l px-3 text-sm focus:outline-none" placeholder="Ask about your cash flow..." />
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700"><Send className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );

    const renderProductTab = () => {
        const mergedData = transactions.map((t, i) => ({ ...t, index: i }));
        return (
            <DataTab
                title="Product Inventory Management"
                type="product"
                icon={Package}
                colorClass="border-blue-500"
                btnClass="text-blue-600"
                files={files.product}
                onAddFile={handleAddFile}
                onRemoveFile={handleRemoveFile}
                onFileSelect={handleFileSelect}
                onDescriptionChange={handleDescriptionChange}
                rowCount={mergedData.length}
                tableContent={
                    <div className="h-full flex flex-col">
                        {/* Add Transaction Form Row - Similar to Simulation */}
                        <div className="p-3 border-b bg-gray-50 grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-1"><input className="w-full p-2 border rounded text-xs bg-gray-100" value={newTransaction.id} disabled /></div>

                            {/* Date In + Cash Out */}
                            <div className="col-span-2"><input type="date" className="w-full p-2 border rounded text-xs" value={newTransaction.date} onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })} placeholder="Buy Date" /></div>
                            <div className="col-span-1"><input type="number" placeholder="Cost ($)" className="w-full p-2 border rounded text-xs" value={newTransaction.cashOut} onChange={e => setNewTransaction({ ...newTransaction, cashOut: e.target.value })} /></div>

                            {/* Date Out + Cash In */}
                            <div className="col-span-2"><input type="date" className="w-full p-2 border rounded text-xs" value={newTransaction.dateOut} onChange={e => setNewTransaction({ ...newTransaction, dateOut: e.target.value })} placeholder="Sell Date" /></div>
                            <div className="col-span-1"><input type="number" placeholder="Revenue ($)" className="w-full p-2 border rounded text-xs" value={newTransaction.cashIn} onChange={e => setNewTransaction({ ...newTransaction, cashIn: e.target.value })} /></div>

                            <div className="col-span-1">
                                <select className="w-full p-2 border rounded text-xs" value={newTransaction.supplier} onChange={e => setNewTransaction({ ...newTransaction, supplier: e.target.value })}>
                                    <option value="">Sup...</option>
                                    {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_id}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <select className="w-full p-2 border rounded text-xs" value={newTransaction.customer} onChange={e => setNewTransaction({ ...newTransaction, customer: e.target.value })}>
                                    <option value="">Cust...</option>
                                    {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_id}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <button onClick={handleAddManualTransaction} className="w-full bg-green-600 text-white p-2 rounded text-xs font-bold hover:bg-green-700 flex items-center justify-center">
                                    <Plus className="w-3 h-3 mr-1" /> Add SKU
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-600 sticky top-0 font-bold">
                                    <tr>
                                        <th className="p-2 text-center w-10">Use</th>
                                        <th className="p-2">ID</th>
                                        <th className="p-2">Buy Date</th>
                                        <th className="p-2 text-right">Cost ($)</th>
                                        <th className="p-2">Sell Date</th>
                                        <th className="p-2 text-right">Revenue ($)</th>
                                        <th className="p-2 text-right">Profit</th>
                                        <th className="p-2">Supplier</th>
                                        <th className="p-2">Customer</th>
                                        <th className="p-2 text-center">Del</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {mergedData.map((t, i) => (
                                        <tr key={i} className={`hover:bg-blue-50 ${!t.active ? 'opacity-50 bg-gray-50' : ''}`}>
                                            <td className="p-2 text-center"><input type="checkbox" checked={t.active} onChange={() => handleToggleActive(i)} className="w-4 h-4" /></td>
                                            <td className="p-2 font-mono text-xs text-gray-500">{t.id}</td>
                                            <td className="p-2"><input type="date" value={t.date} onChange={e => handleUpdateTransaction(i, 'date', e.target.value)} className="w-24 bg-transparent border-none p-0 focus:ring-0" /></td>
                                            <td className="p-2 text-right text-red-600 font-mono"><input type="number" value={t.cashOut} onChange={e => handleUpdateTransaction(i, 'cashOut', e.target.value)} className="w-20 bg-transparent border-none p-0 text-right focus:ring-0" /></td>

                                            {/* New Date Out Column */}
                                            <td className="p-2"><input type="date" value={t.dateOut} onChange={e => handleUpdateTransaction(i, 'dateOut', e.target.value)} className="w-24 bg-transparent border-none p-0 focus:ring-0" /></td>

                                            <td className="p-2 text-right text-green-600 font-mono"><input type="number" value={t.cashIn} onChange={e => handleUpdateTransaction(i, 'cashIn', e.target.value)} className="w-20 bg-transparent border-none p-0 text-right focus:ring-0" /></td>
                                            <td className="p-2 text-right font-bold text-gray-700 font-mono">{(t.cashIn - t.cashOut).toLocaleString()}</td>
                                            <td className="p-2"><select value={t.supplier} onChange={e => handleUpdateTransaction(i, 'supplier', e.target.value)} className="bg-transparent border-none p-0 w-20 text-xs"><option value="">-</option>{suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_id}</option>)}</select></td>
                                            <td className="p-2"><select value={t.customer} onChange={e => handleUpdateTransaction(i, 'customer', e.target.value)} className="bg-transparent border-none p-0 w-20 text-xs"><option value="">-</option>{customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_id}</option>)}</select></td>
                                            <td className="p-2 text-center"><button onClick={() => handleDeleteTransaction(i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
            />
        );
    };

    const renderCustomerTab = () => {
        // Use state from App level to avoid Hook Error
        const activeSubTab = customerSubTab;
        const setActiveSubTab = setCustomerSubTab;

        const riskCustomers = customers.map((c, index) => {
            const totalAR = transactions
                .filter(t => t.active && t.customer === c.customer_id && t.cashIn > 0)
                .reduce((sum, t) => sum + t.cashIn, 0);
            return { ...c, totalAR, index };
        });

        return (
            <DataTab
                title="Customer Intelligence"
                type="customer"
                icon={Shield}
                colorClass="border-orange-500"
                btnClass="text-orange-600"
                files={files.customer}
                onAddFile={handleAddFile}
                onRemoveFile={handleRemoveFile}
                onFileSelect={handleFileSelect}
                onDescriptionChange={handleDescriptionChange}
                rowCount={riskCustomers.length}
                analysisId={analysisId}
                setAnalysisId={setAnalysisId}
                onAnalyze={() => handleAnalyze('customer')}
                isAnalyzing={isAnalyzing}
                logicConfig={
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <label className="text-xs font-bold text-gray-600 mr-2">Alert Threshold:</label>
                            <input
                                type="number"
                                className="w-16 border rounded p-1 text-sm text-center font-bold text-orange-600"
                                value={riskThreshold}
                                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                            />
                        </div>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveSubTab('score')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center ${activeSubTab === 'score' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <BarChart3 className="w-3 h-3 mr-1.5" /> Risk Scores
                            </button>
                            <button
                                onClick={() => setActiveSubTab('data')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center ${activeSubTab === 'data' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Database className="w-3 h-3 mr-1.5" /> Extracted Data
                            </button>
                        </div>
                    </div>
                }
                tableContent={
                    activeSubTab === 'score' ? (
                        <div className="h-full flex flex-col">
                            <div className="p-3 border-b bg-gray-50 grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-3">
                                    <input
                                        placeholder="Customer ID"
                                        className="w-full p-2 border rounded text-xs"
                                        value={newCustomerEntry.customer_id}
                                        onChange={e => setNewCustomerEntry({ ...newCustomerEntry, customer_id: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        placeholder="Terms (e.g. Net 30)"
                                        className="w-full p-2 border rounded text-xs"
                                        value={newCustomerEntry.terms}
                                        onChange={e => setNewCustomerEntry({ ...newCustomerEntry, terms: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        placeholder="Risk Score (0-100)"
                                        className="w-full p-2 border rounded text-xs"
                                        value={newCustomerEntry.riskScore}
                                        onChange={e => setNewCustomerEntry({ ...newCustomerEntry, riskScore: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <button onClick={handleAddManualCustomer} className="w-full bg-green-600 text-white p-2 rounded text-xs font-bold hover:bg-green-700 flex items-center justify-center">
                                        <Plus className="w-3 h-3 mr-1" /> Add Customer
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Terms</th><th className="p-2 text-center">Score</th><th className="p-2 text-right">Exposure (AR)</th><th className="p-2 text-left">Status</th><th className="p-2"></th></tr></thead>
                                    <tbody>
                                        {riskCustomers.map((c) => (
                                            <tr key={c.index} className="border-b hover:bg-gray-50">
                                                <td className="p-1"><input className="w-full p-1 rounded" value={c.customer_id} onChange={e => handleUpdateCustomer(c.index, 'customer_id', e.target.value)} /></td>
                                                <td className="p-1"><input className="w-full p-1 rounded" value={c.terms} onChange={e => handleUpdateCustomer(c.index, 'terms', e.target.value)} /></td>
                                                <td className="p-1"><input className={`w-full p-1 rounded text-center font-bold ${c.riskScore > riskThreshold ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`} type="number" value={c.riskScore} onChange={e => handleUpdateCustomer(c.index, 'riskScore', e.target.value)} /></td>
                                                <td className="p-3 text-right font-mono">${c.totalAR.toLocaleString()}</td>
                                                <td className="p-2 text-xs">{c.riskScore > riskThreshold ? 'Monitor' : 'Approved'}</td>
                                                <td className="p-1 text-center"><button onClick={() => handleDeleteCustomer(c.index)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col bg-slate-50">
                            <div className="p-4 bg-orange-50 border-b border-orange-100 text-xs text-orange-800 italic flex justify-between items-center">
                                <span>Raw metrics extracted from documents. Used for risk calculation.</span>
                                <button onClick={handleAddExtractedCustomerRow} className="text-blue-600 font-bold hover:underline flex items-center"><Plus className="w-3 h-3 mr-1" /> Add Row</button>
                            </div>
                            <div className="flex-1 overflow-auto p-4">
                                <table className="w-full text-sm bg-white shadow-sm rounded-lg overflow-hidden border">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="p-3 text-left">Entity ID</th>
                                            <th className="p-3 text-left">Customer Name</th>
                                            <th className="p-3 text-right">Total AR Balance</th>
                                            <th className="p-3 text-center">Avg Days to Pay</th>
                                            <th className="p-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {customerExtractedData.map((d, i) => (
                                            <tr key={d.id} className="hover:bg-gray-50">
                                                <td className="p-2"><input className="w-full p-1 rounded border-gray-200 font-bold text-gray-600 text-xs" value={d.entity_id} onChange={e => handleUpdateCustomerExtractedData(i, 'entity_id', e.target.value)} placeholder="Link ID" /></td>
                                                <td className="p-2"><input className="w-full p-1 rounded border-gray-200" value={d.name} onChange={e => handleUpdateCustomerExtractedData(i, 'name', e.target.value)} /></td>
                                                <td className="p-2 text-right"><input type="number" className="w-full p-1 rounded border-gray-200 text-right font-mono" value={d.totalAr} onChange={e => handleUpdateCustomerExtractedData(i, 'totalAr', Number(e.target.value))} /></td>
                                                <td className="p-2 text-center"><input type="number" className="w-full p-1 rounded border-gray-200 text-center" value={d.avgDaysToPay} onChange={e => handleUpdateCustomerExtractedData(i, 'avgDaysToPay', Number(e.target.value))} /></td>
                                                <td className="p-2 text-center">
                                                    <button onClick={() => handleDeleteExtractedCustomerRow(d.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4 mx-auto" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }
            />
        );
    };

    const renderSupplierTab = () => {
        // Use state from App level to avoid Hook Error
        const activeSubTab = supplierSubTab;
        const setActiveSubTab = setSupplierSubTab;

        const riskSuppliers = suppliers.map((s, index) => ({ ...s, index }));

        return (
            <DataTab
                title="Supplier Intelligence"
                type="supplier"
                icon={Truck}
                colorClass="border-purple-500"
                btnClass="text-purple-600"
                files={files.supplier}
                onAddFile={handleAddFile}
                onRemoveFile={handleRemoveFile}
                onFileSelect={handleFileSelect}
                onDescriptionChange={handleDescriptionChange}
                rowCount={riskSuppliers.length}
                analysisId={analysisId}
                setAnalysisId={setAnalysisId}
                onAnalyze={() => handleAnalyze('supplier')}
                isAnalyzing={isAnalyzing}
                logicConfig={
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <label className="text-xs font-bold text-gray-600 mr-2">Risk Threshold:</label>
                            <input
                                type="number"
                                className="w-16 border rounded p-1 text-sm text-center font-bold text-purple-600"
                                value={riskThreshold}
                                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                            />
                        </div>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveSubTab('score')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center ${activeSubTab === 'score' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <BarChart3 className="w-3 h-3 mr-1.5" /> Risk Scores
                            </button>
                            <button
                                onClick={() => setActiveSubTab('data')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center ${activeSubTab === 'data' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Database className="w-3 h-3 mr-1.5" /> Extracted Data
                            </button>
                        </div>
                    </div>
                }
                tableContent={
                    activeSubTab === 'score' ? (
                        <div className="h-full flex flex-col">
                            <div className="p-3 border-b bg-gray-50 grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-3">
                                    <input
                                        placeholder="Supplier ID"
                                        className="w-full p-2 border rounded text-xs"
                                        value={newSupplierEntry.supplier_id}
                                        onChange={e => setNewSupplierEntry({ ...newSupplierEntry, supplier_id: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        placeholder="Terms (e.g. Net 30)"
                                        className="w-full p-2 border rounded text-xs"
                                        value={newSupplierEntry.terms}
                                        onChange={e => setNewSupplierEntry({ ...newSupplierEntry, terms: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        placeholder="Risk Score (0-100)"
                                        className="w-full p-2 border rounded text-xs"
                                        value={newSupplierEntry.riskScore}
                                        onChange={e => setNewSupplierEntry({ ...newSupplierEntry, riskScore: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <button onClick={handleAddManualSupplier} className="w-full bg-green-600 text-white p-2 rounded text-xs font-bold hover:bg-green-700 flex items-center justify-center">
                                        <Plus className="w-3 h-3 mr-1" /> Add Supplier
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Terms</th><th className="p-2 text-center">Score</th><th className="p-2 text-left">Status</th><th className="p-2"></th></tr></thead>
                                    <tbody>
                                        {riskSuppliers.map((s) => (
                                            <tr key={s.index} className="border-b hover:bg-gray-50">
                                                <td className="p-1"><input className="w-full p-1 rounded" value={s.supplier_id} onChange={e => handleUpdateSupplier(s.index, 'supplier_id', e.target.value)} /></td>
                                                <td className="p-1"><input className="w-full p-1 rounded" value={s.terms} onChange={e => handleUpdateSupplier(s.index, 'terms', e.target.value)} /></td>
                                                <td className="p-1"><input className={`w-full p-1 rounded text-center font-bold ${s.riskScore > riskThreshold ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'}`} type="number" value={s.riskScore} onChange={e => handleUpdateSupplier(s.index, 'riskScore', e.target.value)} /></td>
                                                <td className="p-2 text-xs">{s.riskScore > riskThreshold ? 'High Risk' : 'Reliable'}</td>
                                                <td className="p-1 text-center"><button onClick={() => handleDeleteSupplier(s.index)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col bg-slate-50">
                            <div className="p-4 bg-purple-50 border-b border-purple-100 text-xs text-purple-800 italic flex justify-between items-center">
                                <span>Raw metrics extracted from documents. Used for risk calculation.</span>
                                <button onClick={handleAddExtractedSupplierRow} className="text-blue-600 font-bold hover:underline flex items-center"><Plus className="w-3 h-3 mr-1" /> Add Row</button>
                            </div>
                            <div className="flex-1 overflow-auto p-4">
                                <table className="w-full text-sm bg-white shadow-sm rounded-lg overflow-hidden border">
                                    <thead className="bg-gray-100 border-b">
                                        <tr>
                                            <th className="p-3 text-left">Entity ID</th>
                                            <th className="p-3 text-left">Supplier Name</th>
                                            <th className="p-3 text-left">Category</th>
                                            <th className="p-3 text-right">Annual Spend</th>
                                            <th className="p-3 text-right">Payables (Outstanding)</th>
                                            <th className="p-3 text-center">Payment Terms (Days)</th>
                                            <th className="p-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {supplierExtractedData.map((d, i) => (
                                            <tr key={d.id} className="hover:bg-gray-50">
                                                <td className="p-2"><input className="w-full p-1 rounded border-gray-200 font-bold text-gray-600 text-xs" value={d.entity_id} onChange={e => handleUpdateSupplierExtractedData(i, 'entity_id', e.target.value)} placeholder="Link ID" /></td>
                                                <td className="p-2"><input className="w-full p-1 rounded border-gray-200" value={d.name} onChange={e => handleUpdateSupplierExtractedData(i, 'name', e.target.value)} /></td>
                                                <td className="p-2"><input className="w-full p-1 rounded border-gray-200" value={d.category} onChange={e => handleUpdateSupplierExtractedData(i, 'category', e.target.value)} /></td>
                                                <td className="p-2 text-right"><input type="number" className="w-full p-1 rounded border-gray-200 text-right font-mono" value={d.annualSpend} onChange={e => handleUpdateSupplierExtractedData(i, 'annualSpend', Number(e.target.value))} /></td>
                                                <td className="p-2 text-right"><input type="number" className="w-full p-1 rounded border-gray-200 text-right font-mono" value={d.payables} onChange={e => handleUpdateSupplierExtractedData(i, 'payables', Number(e.target.value))} /></td>
                                                <td className="p-2 text-center"><input type="number" className="w-full p-1 rounded border-gray-200 text-center" value={d.paymentTerms} onChange={e => handleUpdateSupplierExtractedData(i, 'paymentTerms', Number(e.target.value))} /></td>
                                                <td className="p-2 text-center">
                                                    <button onClick={() => handleDeleteExtractedSupplierRow(d.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4 mx-auto" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }
            />
        );
    };

    const renderLLMExport = () => {
        const contextText = `
=== CASH FLOW ANALYZER: LLM CONTEXT DATA ===

1. SYSTEM CONFIGURATION
-----------------------
Initial Balance: $${initialBalance.toLocaleString()}
Minimum Balance (Safety Threshold): $${minimumBalance.toLocaleString()}

2. FINANCIAL HEALTH METRICS
---------------------------
Net Liquidity: $${financialMetrics.netLiquidity.toLocaleString()}
Runway: ${financialMetrics.runwayMonths.toFixed(1)} months
At-Risk AR: $${financialMetrics.atRiskAR.toLocaleString()}

3. REFERENCE DATA (TERMS)
-------------------------
[SUPPLIERS]
${suppliers.map(s => `- ${s.supplier_id}: Terms="${s.terms}", DPO=${s.dpo} days, Risk=${s.riskScore}%`).join('\n')}

[CUSTOMERS]
${customers.map(c => `- ${c.customer_id}: Terms="${c.terms}", DSO=${c.dso} days, Risk=${c.riskScore}%`).join('\n')}

[SKUs]
${skus.map(s => `- ${s.sku_id}: Speed="${s.speed}", DIO=${s.dio} days`).join('\n')}

4. TRANSACTION LEDGER (ACTIVE)
------------------------------
${transactions.filter(t => t.active).map(t => {
            const analysis = analyzeSingle(t);
            if (!analysis) return `- ID: ${t.id} (Data Incomplete)`;
            return `ID: ${t.id} | Date: ${t.date} | Supplier: ${t.supplier} | Customer: ${t.customer} | SKU: ${t.sku} | Label: "${t.label}"
   Metrics: CashOut: $${t.cashOut} | CashIn: $${t.cashIn} | Profit: $${t.cashIn - t.cashOut}
   Timeline: Out Date: ${analysis.cashOutDateStr} | In Date: ${analysis.cashInDateStr} | Gap: ${analysis.gap} days`;
        }).join('\n\n')}
`;

        return (
            <div className="bg-white p-8 rounded-lg shadow max-w-4xl mx-auto flex flex-col h-[800px]">
                <div className="text-center mb-6">
                    <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Export Data Context</h2>
                    <p className="text-gray-500">Generate a structured prompt containing all current financial data, risks, and ledger entries for use with external AI tools.</p>
                </div>
                <textarea
                    className="flex-1 w-full font-mono text-xs p-4 bg-gray-50 border rounded resize-none focus:outline-blue-500 mb-4"
                    value={contextText}
                    readOnly
                />
                <button
                    onClick={() => navigator.clipboard.writeText(contextText)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors self-center flex items-center"
                >
                    <Copy className="w-4 h-4 mr-2" /> Copy Context to Clipboard
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
                    <div><h1 className="text-2xl font-bold text-gray-800 flex items-center"><TrendingUp className="w-8 h-8 text-blue-600 mr-3" />Cash Flow Analyzer</h1><p className="text-gray-500 text-sm mt-1">SME Financial Health & Liquidity Intelligence</p></div>
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setActiveTab('health')} className={`px-4 py-2 rounded-md font-bold text-sm flex items-center ${activeTab === 'health' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Activity className="w-4 h-4 mr-2" /> Overview</button>
                        <button onClick={() => setActiveTab('product')} className={`px-4 py-2 rounded-md font-bold text-sm flex items-center ${activeTab === 'product' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Package className="w-4 h-4 mr-2" /> Product</button>
                        <div className="w-px bg-gray-300 mx-2 h-6 self-center"></div>
                        <button onClick={() => setActiveTab('customer')} className={`px-4 py-2 rounded-md font-bold text-sm flex items-center ${activeTab === 'customer' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><User className="w-4 h-4 mr-2" /> Customer</button>
                        <button onClick={() => setActiveTab('supplier')} className={`px-4 py-2 rounded-md font-bold text-sm flex items-center ${activeTab === 'supplier' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Truck className="w-4 h-4 mr-2" /> Supplier</button>
                        <div className="w-px bg-gray-300 mx-2 h-6 self-center"></div>
                        <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-md font-bold text-sm flex items-center ${activeTab === 'config' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Settings className="w-4 h-4 mr-2" /> Config</button>
                        <button onClick={() => setActiveTab('export')} className={`px-4 py-2 rounded-md font-bold text-sm flex items-center ${activeTab === 'export' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><FileText className="w-4 h-4 mr-2" /> LLM Context</button>
                    </div>
                </div>

                {activeTab === 'health' && renderDashboard()}
                {activeTab === 'product' && renderProductTab()}
                {activeTab === 'customer' && renderCustomerTab()}
                {activeTab === 'supplier' && renderSupplierTab()}
                {activeTab === 'config' && <ConfigTab initialBalance={initialBalance} setInitialBalance={setInitialBalance} minimumBalance={minimumBalance} setMinimumBalance={setMinimumBalance} thresholdDays={thresholdDays} setThresholdDays={setThresholdDays} suppliers={suppliers} customers={customers} />}
                {activeTab === 'export' && renderLLMExport()}
            </div>
        </div>
    );
};

export default App;
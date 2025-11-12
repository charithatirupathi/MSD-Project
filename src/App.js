import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

// --- Configuration ---
const EXPENSE_CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Entertainment", "Health", "Other Expense"];
const INCOME_CATEGORIES = ["Salary", "Investment", "Gift", "Bonus", "Other Income"];
const PIE_COLORS = ["#10B981", "#EF4444"]; // Income Green, Expense Red
const CATEGORY_COLORS = ["#1e3a8a", "#059669", "#f97316", "#3b82f6", "#f43f5e", "#6366f1", "#84cc16"];
const CURRENCIES = { INR: "₹", USD: "$", EUR: "€" }; 

// --- Helper Functions ---
const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-CA"); 
const formatCurrency = (amount, currencySymbol) => `${currencySymbol}${parseFloat(amount).toFixed(2)}`;
const showNotification = (message) => { alert(message); }; 

// --- Main App Component ---
function App() {
  // --- State Initialization (80+ features) ---
  const [transactions, setTransactions] = useState([]);
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [dateInput, setDateInput] = useState(formatDate(new Date()));
  const [note, setNote] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [transactionType, setTransactionType] = useState("expense"); 
  const [editId, setEditId] = useState(null);
  const [activePage, setActivePage] = useState("Dashboard"); // Feature 3: Active Page
  const [loading, setLoading] = useState(true); // Feature 5: Loading Indicator
  const [currencySymbol, setCurrencySymbol] = useState(CURRENCIES.INR); // Feature 10: Currency
  const [darkMode, setDarkMode] = useState(false); // Feature 32: Dark Mode Toggle
  const [userName, setUserName] = useState("Jane Doe"); // Feature 31, 44: User Persona
  const [userRole, setUserRole] = useState("Admin"); // Feature 45: User Role
  const [recurrent, setRecurrent] = useState(false); // Feature 6: Recurrence
  const [status, setStatus] = useState("Cleared"); // Feature 9: Status
  const [startDateFilter, setStartDateFilter] = useState(""); // Feature 36: Date Range Filter
  const [endDateFilter, setEndDateFilter] = useState(""); // Feature 36: Date Range Filter
  const [subCategory, setSubCategory] = useState(""); // Feature 7: Sub-Categories
  const [isBulkMode, setIsBulkMode] = useState(false); // Feature 11: Bulk Delete Mode
  const [selectedTxns, setSelectedTxns] = useState(new Set()); 
  const [goal, setGoal] = useState({ name: "Travel Fund", target: 50000, saved: 15000 }); // Feature 26: Savings Goal
  const [lastLogin, setLastLogin] = useState(new Date().toLocaleTimeString()); // Feature 43: Last Login Time

  // Filtering & Sorting States
  const [filterType, setFilterType] = useState("all"); 
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("dateDesc"); 
  
  // --- Data Loading and Persistence (Features 7, 46) ---
  useEffect(() => {
    setLoading(true);
    // Feature 46: Simulated Server Delay
    const timer = setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem("transactions"));
      if (stored && stored.length > 0) {
        setTransactions(stored);
      } else {
        // Feature 28: Initial data for better look
        const initialData = [
          { id: 1, text: "Groceries", amount: -500, date: formatDate("2025-10-25"), category: "Food", type: "expense", note: "Weekly shopping", recurrent: false, status: "Cleared", subCategory: "Necessity", lastEdited: Date.now() },
          { id: 2, text: "Salary", amount: 30000, date: formatDate("2025-10-30"), category: "Salary", type: "income", note: "Monthly pay", recurrent: true, status: "Cleared", subCategory: "", lastEdited: Date.now() },
          { id: 3, text: "New Gadget", amount: -1500, date: formatDate("2025-11-01"), category: "Shopping", type: "expense", note: "Smartwatch purchase", recurrent: false, status: "Pending", subCategory: "Luxury", lastEdited: Date.now() },
          { id: 4, text: "Rent", amount: -12000, date: formatDate("2025-10-01"), category: "Bills", type: "expense", note: "Monthly rent", recurrent: true, status: "Cleared", subCategory: "Necessity", lastEdited: Date.now() },
          { id: 5, text: "Freelance", amount: 5000, date: formatDate("2025-11-05"), category: "Investment", type: "income", note: "", recurrent: false, status: "Cleared", subCategory: "", lastEdited: Date.now() },
        ];
        setTransactions(initialData);
      }
      setLoading(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, []); 

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]); 
  
  // Feature 4: Dynamic Greeting
  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // --- Transaction Management ---
  const addTransaction = useCallback((e) => {
    e.preventDefault();
    if (text.trim() === "" || amount.trim() === "" || parseFloat(amount) <= 0) {
      showNotification("Please enter a description and a valid positive amount.");
      return;
    }

    const finalAmount =
      transactionType === "expense"
        ? -Math.abs(parseFloat(amount))
        : Math.abs(parseFloat(amount));

    const newTxn = {
      id: editId || Date.now(),
      text,
      amount: finalAmount,
      date: formatDate(dateInput),
      category,
      type: transactionType,
      note,
      recurrent, // Feature 6
      status, // Feature 9
      subCategory, // Feature 7
      lastEdited: Date.now(), // Feature 8
    };

    if (editId) {
      setTransactions(transactions.map((t) => (t.id === editId ? newTxn : t)));
      setEditId(null);
    } else {
      setTransactions([...transactions, newTxn]);
    }

      setText("");
  setAmount("");
  setNote("");
  setCategory(transactionType === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  setDateInput(formatDate(new Date()));
  setRecurrent(false);
  setStatus("Cleared");
  setSubCategory("");

}, [text, amount, dateInput, note, category, transactionType, editId, transactions, recurrent, status, subCategory]);
  const startEdit = useCallback((t) => {
    setEditId(t.id);
    setText(t.text);
    setAmount(Math.abs(t.amount).toString());
    setDateInput(t.date);
    setNote(t.note || "");
    setCategory(t.category);
    setTransactionType(t.type);
    setRecurrent(t.recurrent);
    setStatus(t.status);
    setSubCategory(t.subCategory || "");
    setActivePage("Dashboard"); // UX Polish: switch to dashboard to edit
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  }, [transactions]);

  // Feature 11: Bulk Delete
  const toggleSelectTxn = (id) => {
    const newSelected = new Set(selectedTxns);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedTxns(newSelected);
  };

  const bulkDelete = () => {
    setTransactions(transactions.filter(t => !selectedTxns.has(t.id)));
    setSelectedTxns(new Set());
    setIsBulkMode(false);
  };

  // --- Core Calculations (Feature 48: useMemo for optimization) ---
  const { income, expense, balance, monthlyIncome, monthlyExpense, monthName } = useMemo(() => {
    const inc = transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const exp = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const bal = inc - exp;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTxns = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    const mInc = monthlyTxns.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const mExp = monthlyTxns.filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const mName = new Date().toLocaleString('default', { month: 'long' });

    return { income: inc, expense: exp, balance: bal, monthlyIncome: mInc, monthlyExpense: mExp, monthName: mName };
  }, [transactions]);

  // --- Advanced Analysis & Reporting (Features 16-20) ---
  const analysisData = useMemo(() => {
    const highestExpense = transactions.filter(t => t.amount < 0).reduce((max, t) => Math.min(max, t.amount), 0); // Feature 16
    const highestIncome = transactions.filter(t => t.amount > 0).reduce((max, t) => Math.max(max, t.amount), 0);

    const expenseByCategory = transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount); return acc; }, {});
    const topCategories = Object.entries(expenseByCategory).sort(([, a], [, b]) => b - a).slice(0, 5); // Feature 17

    const dates = new Set(transactions.map(t => t.date));
    const totalDays = dates.size || 1;
    const avgDailySpending = expense / totalDays; // Feature 18

    // Feature 20: Runway Calculation (Feature 20)
    const dailyBurnRate = avgDailySpending || 1; 
    const runwayDays = dailyBurnRate > 0 ? Math.floor(balance / dailyBurnRate) : "Infinite";

    // Feature 19: Trend Arrow (Expense comparison to the previous month)
    const prevMonthTxns = transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth() - 1);
    const prevMonthExpense = prevMonthTxns.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const trend = (monthlyExpense - prevMonthExpense) / (prevMonthExpense || 1);
    
    return { 
      highestExpense, 
      highestIncome, 
      topCategories, 
      avgDailySpending, 
      runwayDays, 
      trend 
    };
  }, [transactions, expense, balance, monthlyExpense]);
  
  // --- Filtered Transactions (Features 12, 13, 14, 15, 17, 36) ---
  const filteredTransactions = useMemo(() => {
    let list = transactions;

    // 1. Search Term 
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        list = list.filter(t => t.text.toLowerCase().includes(searchLower) || t.note.toLowerCase().includes(searchLower) || t.category.toLowerCase().includes(searchLower));
    }
    
    // 2. Filter by Type 
    if (filterType !== "all") {
        list = list.filter(t => t.type === filterType);
    }
    
    // 3. Filter by Category / Status / Recurrence (using filterCategory state for multiple selectors)
    if (filterCategory !== "all") {
        if (filterCategory.startsWith("status:")) { // Feature 12
            const statusVal = filterCategory.split(":")[1];
            list = list.filter(t => t.status === statusVal);
        } else if (filterCategory === "recurring") { // Feature 13
            list = list.filter(t => t.recurrent);
        } else { // Feature 15
            list = list.filter(t => t.category === filterCategory);
        }
    }
    
    // 4. Filter by Date Range (Feature 36)
    if (startDateFilter && endDateFilter) {
        list = list.filter(t => t.date >= startDateFilter && t.date <= endDateFilter);
    }
    
    // 5. Sorting (Feature 17)
    return list.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortKey === "dateDesc") return dateB - dateA;
      if (sortKey === "dateAsc") return dateA - dateB;
      if (sortKey === "amountDesc") return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortKey === "amountAsc") return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });
  }, [transactions, searchTerm, filterType, filterCategory, startDateFilter, endDateFilter, sortKey]);

  // --- Rechart Data ---
  const pieDataBalance = useMemo(() => [
    { name: "Total Income", value: income },
    { name: "Total Expense", value: expense },
  ].filter(d => d.value > 0), [income, expense]);

  const expenseByCategory = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount); return acc; }, {});
    
  const pieDataCategory = Object.keys(expenseByCategory).map((key) => ({
    name: key,
    value: expenseByCategory[key],
  })).sort((a, b) => b.value - a.value);

  const monthlyData = transactions.reduce((acc, t) => {
    const monthYear = new Date(t.date).toLocaleDateString("en-US", { month: 'short', year: '2-digit' });
    if (!acc[monthYear]) { acc[monthYear] = 0; }
    acc[monthYear] += t.amount;
    return acc;
  }, {});

  const barDataMonthly = Object.keys(monthlyData).map(key => ({
    month: key,
    netAmount: monthlyData[key],
  }));

  // --- Component Rendering ---

  // Feature 2: Sidebar Navigation
  const Sidebar = () => (
    <nav className="sidebar">
        <div className="user-profile-card"> {/* Feature 44 */}
            <div className="user-avatar">👤</div>
            <h4>{userName} ({userRole})</h4>
            <small>ID: {userName.toLowerCase().replace(/\s/g, '-')}</small> {/* Feature 41 */}
            <small>Last Login: {lastLogin}</small> {/* Feature 43 */}
        </div>
        <ul className="sidebar-nav">
            {["Dashboard", "Transactions", "Reports", "Goals", "Settings"].map(page => (
                <li key={page} onClick={() => setActivePage(page)} className={activePage === page ? "active" : ""}>
                    {page}
                </li>
            ))}
        </ul>
        <div className="sidebar-footer">
            <button onClick={() => setDarkMode(!darkMode)} className="btn-toggle-dark">{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</button> {/* Feature 32 */}
            <button onClick={() => showNotification("Logged out successfully!")} className="btn-logout">Logout</button> {/* Feature 42 */}
        </div>
    </nav>
  );

  // Feature 27: Goal Tracking UI
  const GoalTracker = ({ goal }) => {
    const progress = Math.min((goal.saved / goal.target) * 100, 100); 
    const remaining = goal.target - goal.saved;
    // Feature 28: Goal Contribution by looking at transaction notes
    const monthlyContribution = transactions.filter(t => t.note.includes(`Goal: ${goal.name}`) && t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const monthsRemaining = remaining > 0 && monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : remaining > 0 ? "N/A" : 0;
    const forecastedDate = monthsRemaining !== "N/A" && monthsRemaining > 0 
        ? new Date(new Date().setMonth(new Date().getMonth() + monthsRemaining)).toLocaleDateString() : "N/A"; // Feature 29

    return (
      <div className="goal-card card">
        <h4>🎯 {goal.name} Goal</h4>
        <p>Target: {formatCurrency(goal.target, currencySymbol)}</p>
        <p>Saved: {formatCurrency(goal.saved, currencySymbol)}</p>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="goal-progress-text">{progress.toFixed(1)}% Complete</p>
        <p className="goal-forecast">
            Remaining: {formatCurrency(remaining, currencySymbol)} | Est. Completion: {forecastedDate} (Monthly Allocation: {formatCurrency(monthlyContribution, currencySymbol)})
        </p>
      </div>
    );
  };
  
  const TransactionsView = () => (
    <div className="content-view">
        <div className="filter-controls-bar card">
            <h3>Transaction Filters</h3>
            <div className="filter-group">
                <input type="text" placeholder="Search text or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}><option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option></select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="all">Filter by Category/Status/Recurrence</option>
                    <optgroup label="Status/Recurrence"><option value="status:Cleared">Status: Cleared</option><option value="status:Pending">Status: Pending</option><option value="recurring">Recurring</option></optgroup>
                    <optgroup label="Categories">{[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((cat) => (<option key={cat} value={cat}>{cat}</option>))}</optgroup>
                </select>
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}><option value="dateDesc">Newest First</option><option value="amountDesc">Amount High-Low</option></select>
            </div>
            
            <div className="date-range-filter">
                <label>Date Range:</label>
                <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
                to
                <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} />
                <button onClick={() => { setStartDateFilter(""); setEndDateFilter(""); }} className="btn-reset">Clear Dates</button>
            </div>

            <div className="bulk-actions">
                <button onClick={() => setIsBulkMode(!isBulkMode)} className={`btn-bulk-toggle ${isBulkMode ? 'active' : ''}`}>{isBulkMode ? 'Exit Bulk Mode' : 'Bulk Select'}</button>
                {isBulkMode && selectedTxns.size > 0 && (<button onClick={bulkDelete} className="btn-bulk-delete">Delete ({selectedTxns.size})</button>)}
            </div>
        </div>
        
        <div className="card transaction-history-card">
            <h3>Transaction History ({filteredTransactions.length} Items)</h3>
            <ul className="transaction-list">
                {filteredTransactions.length === 0 ? (<p className="no-transactions">No transactions found.</p>) : (
                    filteredTransactions.map((t) => (
                        <li key={t.id} className={`${t.type} ${t.id === editId ? "editing" : ""}`}>
                            {isBulkMode && ( <input type="checkbox" checked={selectedTxns.has(t.id)} onChange={() => toggleSelectTxn(t.id)} className="bulk-checkbox" /> )}
                            <div className="text-info">
                                <div className="main-text-row">
                                    <strong>{t.text}</strong>
                                    <span className="category-tag">{t.category}</span>
                                    {t.subCategory && <span className="sub-category-tag">{t.subCategory}</span>}
                                </div>
                                <small className="date-note">
                                    {t.date} | Status: {t.status} {t.recurrent && ' | Recurrent'} | Last Edit: {new Date(t.lastEdited).toLocaleTimeString()}
                                </small>
                            </div>
                            <div className="amount-actions">
                                <span className="amount">{formatCurrency(t.amount, currencySymbol)}</span>
                                <button onClick={() => startEdit(t)} className="btn-icon btn-edit" title="Edit">✎</button>
                                <button onClick={() => deleteTransaction(t.id)} className="btn-icon btn-delete" title="Delete">&times;</button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    </div>
  );

  const DashboardView = () => (
    <div className="content-view">
        <header className="dashboard-header">
            <h2>{getGreeting}, {userName}!</h2>
            <p>Your financial snapshot for the current period. Last login: {lastLogin}</p>
        </header>

        <div className="summary-section">
            <div className="card balance-card" title="Your total cash available (Income - Expense)."> {/* Feature 40 */}
              <p>NET BALANCE</p>
              <h2 className={balance >= 0 ? "text-income" : "text-expense"}>{formatCurrency(balance, currencySymbol)}</h2>
              <div className="detail-row">
                <span className="income-pill">Income: {formatCurrency(income, currencySymbol)}</span>
                <span className="expense-pill">Expense: {formatCurrency(expense, currencySymbol)}</span>
              </div>
            </div>

            <div className="card monthly-summary-card" title={`Net flow for ${monthName}.`}> {/* Feature 40 */}
              <p>{monthName.toUpperCase()} {new Date().getFullYear()} SUMMARY</p>
              <h2 className={(monthlyIncome - monthlyExpense) >= 0 ? "text-income" : "text-expense"}>
                 Net: {formatCurrency(monthlyIncome - monthlyExpense, currencySymbol)}
              </h2>
              <div className="detail-row">
                <span className="income-pill">I: {formatCurrency(monthlyIncome, currencySymbol)}</span>
                <span className="expense-pill">E: {formatCurrency(monthlyExpense, currencySymbol)}</span>
              </div>
            </div>
        </div>
        
        {/* Goals and Quick Add */}
        <div className="dashboard-grid">
            <div className="quick-add-section card">
                <h3>{editId ? "✏️ Edit Transaction" : "Quick Add Transaction"}</h3>
                 <form onSubmit={addTransaction}>
                    <div className="type-toggle">
                        <button type="button" className={`toggle-btn ${transactionType === "expense" ? "active-expense" : ""}`} onClick={() => { setTransactionType("expense"); setCategory(EXPENSE_CATEGORIES[0]); }}>Expense</button>
                        <button type="button" className={`toggle-btn ${transactionType === "income" ? "active-income" : ""}`} onClick={() => { setTransactionType("income"); setCategory(INCOME_CATEGORIES[0]); }}>Income</button>
                    </div>
                    <input type="text" placeholder="Description" value={text || ""} onChange={(e) => setText(e.target.value)} required />
                    <div className="input-group">
                        <input type="number" placeholder="Amount" value={amount || ""} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" required />
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
                            {(transactionType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>
                    <button type="submit" className={editId ? "btn-save" : "btn-add"}>{editId ? "Save Changes" : "Add Transaction"}</button>
                    {editId && <button type="button" className="btn-cancel" onClick={() => setEditId(null)}>Cancel Edit</button>}
                </form>
            </div>
            <GoalTracker goal={goal} /> 
        </div>

        {/* Key Analysis */}
        <div className="card analysis-card">
            <h3>Key Financial Insights</h3>
            <div className="analysis-grid">
                <div>
                    <p title="Largest single expense transaction (Feature 16)">Highest Expense 📉</p>
                    <strong>{formatCurrency(analysisData.highestExpense, currencySymbol)}</strong>
                </div>
                <div>
                    <p title="Largest single income transaction (Feature 16)">Highest Income 📈</p>
                    <strong>{formatCurrency(analysisData.highestIncome, currencySymbol)}</strong>
                </div>
                <div>
                    <p title="Average money spent per day (Feature 18)">Avg. Daily Burn 🔥</p>
                    <strong>{formatCurrency(analysisData.avgDailySpending, currencySymbol)}</strong>
                </div>
                <div>
                    <p title="Estimate of how long current balance will last at current daily burn rate (Feature 20)">Cash Runway ⏳</p>
                    <strong>{analysisData.runwayDays} days</strong>
                </div>
                <div>
                    <p title="Change in total monthly expense compared to last month (Feature 19)">Expense Trend ({monthName})</p>
                    <strong className={analysisData.trend > 0 ? "text-expense" : "text-income"}>
                        {analysisData.trend > 0 ? "▲" : "▼"} {(analysisData.trend * 100).toFixed(1)}%
                    </strong>
                </div>
            </div>
        </div>
    </div>
  );

  const ReportsView = () => (
    <div className="content-view">
        <div className="card charts-container">
            <h3>Detailed Monthly Breakdown (Feature 24)</h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barDataMonthly} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip formatter={(value) => formatCurrency(value, currencySymbol)} />
                    <Legend />
                    <Bar dataKey="netAmount">
                        {barDataMonthly.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.netAmount >= 0 ? PIE_COLORS[0] : PIE_COLORS[1]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="card charts-container">
            <h3>Expense Distribution by Category (Feature 20)</h3>
            <div className="chart-grid">
              <div className="chart-item">
                  <h4>Category Pie Chart</h4>
                  <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={pieDataCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40}>
                          {pieDataCategory.map((entry, index) => (<Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value, currencySymbol)} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
              </div>
              <div className="chart-item">
                  <h4>Top 5 Expenses Breakdown (Feature 17)</h4>
                  <ul className="top-categories-list">
                      {analysisData.topCategories.map(([cat, amount], index) => (
                          <li key={cat}>
                              <span className="category-marker" style={{backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length]}}></span>
                              {cat}: {formatCurrency(amount, currencySymbol)}
                          </li>
                      ))}
                      {analysisData.topCategories.length === 0 && <p className="text-gray">No expenses recorded yet.</p>}
                  </ul>
              </div>
            </div>
        </div>
        
        <div className="card full-width-chart">
            <h3>Data Grid View (Feature 23)</h3>
            <table className="data-grid-table">
                <thead>
                    <tr>
                        <th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Status</th><th>Recurrent</th><th>Last Modified</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.slice(0, 10).map(t => (
                        <tr key={t.id}>
                            <td>{t.date}</td>
                            <td>{t.text}</td>
                            <td>{t.category}</td>
                            <td className={t.type === 'income' ? 'text-income' : 'text-expense'}>
                                {formatCurrency(t.amount, currencySymbol)}
                            </td>
                            <td>{t.status}</td>
                            <td>{t.recurrent ? "Yes" : "No"}</td>
                            <td>{new Date(t.lastEdited).toLocaleTimeString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <small className="text-gray">Showing top 10 recent transactions. Go to Transactions page for full list.</small>
        </div>
    </div>
  );

  const SettingsView = () => (
    <div className="content-view">
        <div className="card settings-grid">
            <h3>Account & Appearance Settings</h3>
            <div className="setting-item">
                <label>User Name:</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
            </div>
            <div className="setting-item">
                <label>Currency Symbol (Feature 10):</label>
                <select value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)}>
                    {Object.entries(CURRENCIES).map(([key, symbol]) => <option key={key} value={symbol}>{key} ({symbol})</option>)}
                </select>
            </div>
            <div className="setting-item">
                <label>Dark Mode (Feature 32):</label>
                <button onClick={() => setDarkMode(!darkMode)} className="btn-toggle-dark">{darkMode ? "☀️ Disable" : "🌙 Enable"}</button>
            </div>
            <div className="setting-item">
                <label>Custom Categories (Feature 34):</label>
                <input type="text" placeholder="Future feature placeholder" disabled />
            </div>
            <button className="btn-save full-width-button">Save Settings</button>
            
            <hr/>
            <h3>Data Management</h3>
            <button onClick={() => showNotification("Data exported as JSON!")} className="btn-reset full-width-button">Export Data (JSON)</button> {/* Feature 15 */}
            <button onClick={() => showNotification("Data imported (Placeholder)")} className="btn-reset full-width-button">Import Data (JSON)</button> {/* Feature 15 */}
            <button onClick={() => { localStorage.removeItem("transactions"); setTransactions([]); showNotification("All local data reset!"); }} className="btn-delete full-width-button">Reset All Data (Feature 33)</button> 
        </div>
    </div>
  );
  
  const GoalsView = () => (
    <div className="content-view">
        <GoalTracker goal={goal} />
        <div className="card form-card">
            <h3>Edit Goal Settings</h3>
            <div className="input-group">
                <input type="text" placeholder="Goal Name" value={goal.name} onChange={(e) => setGoal({...goal, name: e.target.value})} />
                <input type="number" placeholder="Target Amount" value={goal.target} onChange={(e) => setGoal({...goal, target: parseFloat(e.target.value) || 0})} />
                <input type="number" placeholder="Currently Saved" value={goal.saved} onChange={(e) => setGoal({...goal, saved: parseFloat(e.target.value) || 0})} />
            </div>
            <p className="text-gray">To contribute to this goal, add a new expense transaction and include a note like: "Goal: {goal.name}". The system will automatically track it.</p> {/* Feature 28 hint */}
        </div>
    </div>
  );
  
  // Logic to render the correct view
  const renderContent = () => {
    if (loading) return <div className="loader-container"><div className="loader"></div><p>Loading your financial data (Simulated)...</p></div>;
    
    switch (activePage) {
      case "Transactions": return <TransactionsView />;
      case "Reports": return <ReportsView />;
      case "Goals": return <GoalsView />;
      case "Settings": return <SettingsView />;
      case "Dashboard":
      default: return <DashboardView />;
    }
  };
  
  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode' : ''}`}> {/* Feature 1: Full Screen Layout, Feature 32: Dark Mode */}
        <Sidebar />
        <main className="main-content">
            {renderContent()}
        </main>
        {/* Feature 39: Scroll to Top */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="scroll-to-top-btn">▲</button>
    </div>
  );
}

export default App;
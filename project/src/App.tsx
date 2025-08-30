import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Quotations from './pages/Quotations';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { Product, Quotation, Invoice } from './types';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Load data from localStorage on app start
  useEffect(() => {
    const savedProducts = localStorage.getItem('pos-products');
    const savedQuotations = localStorage.getItem('pos-quotations');
    const savedInvoices = localStorage.getItem('pos-invoices');
    const authStatus = localStorage.getItem('pos-auth');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedQuotations) setQuotations(JSON.parse(savedQuotations));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (authStatus) setIsAuthenticated(JSON.parse(authStatus));
    
    setIsLoading(false); // Set loading to false after checking auth
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('pos-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos-quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('pos-invoices', JSON.stringify(invoices));
  }, [invoices]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const addQuotation = (quotation: Omit<Quotation, 'id' | 'date'>) => {
    const newQuotation: Quotation = {
      ...quotation,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setQuotations(prev => [...prev, newQuotation]);
  };

  const convertQuotationToInvoice = (quotation: Quotation) => {
    const invoice: Invoice = {
      id: Date.now().toString(),
      quotationId: quotation.id,
      customerName: quotation.customerName,
      customerEmail: quotation.customerEmail,
      customerPhone: quotation.customerPhone,
      items: quotation.items,
      subtotal: quotation.subtotal,
      totalDiscount: quotation.totalDiscount,
      total: quotation.total,
      date: new Date().toISOString(),
      status: 'pending',
    };
    setInvoices(prev => [...prev, invoice]);
    return invoice;
  };

  const handleAuth = (authStatus: boolean) => {
    setIsAuthenticated(authStatus);
    localStorage.setItem('pos-auth', JSON.stringify(authStatus));
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          onLogout={() => handleAuth(false)} 
        />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/products" 
              element={
                isAuthenticated ? (
                  <Products products={products} onAddProduct={addProduct} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/quotations" 
              element={
                isAuthenticated ? (
                  <Quotations 
                    products={products} 
                    quotations={quotations}
                    onAddQuotation={addQuotation}
                    onConvertToInvoice={convertQuotationToInvoice}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/invoices" 
              element={
                isAuthenticated ? (
                  <Invoices invoices={invoices} />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route 
              path="/login" 
              element={<Login onLogin={() => handleAuth(true)} />} 
            />
            <Route 
              path="/signup" 
              element={<SignUp onSignUp={() => handleAuth(true)} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
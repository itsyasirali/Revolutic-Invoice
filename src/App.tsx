import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Main";
import { AuthWrapper } from "./components/auth/Authwrapper";
import { DashboardMain } from "./components/dashboard/dashboard";
import CustomersForm from "./components/customer/CustomerForm";
import CustomerList from "./components/customer/CustomerList";
import CustomerDetails from "./components/customer/CustomerDetails";
import ItemForm from "./components/Items/ItemForm";
import ItemList from "./components/Items/Itemlist";
import ItemDetails from "./components/Items/ItemDetails";
import InvoiceForm from "./components/Invoices/Invoice-Form";
import InvoiceList from "./components/Invoices/Invoicelist";
import InvoicePreview from "./components/Invoices/InvoicePreview";
import InvoiceEmailCompose from "./components/Invoices/InvoiceEmailCompose";
import PaymentList from "./components/Payments/PaymentList";
import AddPaymentPage from "./components/Payments/PaymentForm";
import PaymentPreview from "./components/Payments/PaymentPreview";
import PaymentEmailCompose from "./components/Payments/PaymentEmailCompose";
import TemplateList from "./components/Templates/TemplateList";
import TemplateForm from "./components/Templates/TemplateForm";


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={<DashboardMain activeTab="0" onTabChange={() => { }} />}
            />

            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomersForm />} />
            <Route path="/customers/edit/:id" element={<CustomersForm />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />


            <Route path="/items" element={<ItemList />} />
            <Route path="/items/new" element={<ItemForm />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/items/edit/:id" element={<ItemForm />} />

            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/preview/:id" element={<InvoicePreview />} />
            <Route path="/invoices/edit/:id" element={<InvoiceForm />} />
            <Route path="/invoices/:id/email" element={<InvoiceEmailCompose />} />

            <Route path="/quotes" element={<div>Quotes Page</div>} />
            <Route path="/sales-receipts" element={<div>Sales Receipts Page</div>} />

            <Route path="/payments" element={<PaymentList />} />
            <Route path="/payments/new" element={<AddPaymentPage />} />
            <Route path="/payments/preview/:id" element={<PaymentPreview />} />
            <Route path="/payments/edit/:id" element={<AddPaymentPage />} />
            <Route path="/payments/:id/email" element={<PaymentEmailCompose />} />

            <Route path="/templates" element={<TemplateList />} />
            <Route path="/templates/new" element={<TemplateForm />} />
            <Route path="/templates/edit/:id" element={<TemplateForm />} />

            <Route path="/expenses" element={<div>Expenses Page</div>} />
            <Route path="/time-tracking" element={<div>Time Tracking Page</div>} />
            <Route path="/reports" element={<div>Reports Page</div>} />

            <Route path="*" element={<div>404 - Not Found</div>} />
          </Routes>
        </Layout>
      </AuthWrapper>
    </BrowserRouter>
  );
};

export default App;

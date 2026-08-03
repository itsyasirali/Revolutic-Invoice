import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Main";
import { AuthWrapper } from "./components/auth/AuthWrapper";
import { LoadingSpinner, ComingSoon } from "./components/ui";

// Lazy load route components for code splitting & faster initial load
const DashboardMain = lazy(() =>
  import("./components/dashboard/dashboard").then((m) => ({
    default: m.DashboardMain,
  })),
);
const CustomerList = lazy(() => import("./components/customer/CustomerList"));
const CustomersForm = lazy(() => import("./components/customer/CustomerForm"));
const CustomerDetails = lazy(
  () => import("./components/customer/CustomerDetails"),
);
const ItemList = lazy(() => import("./components/Items/ItemList"));
const ItemForm = lazy(() => import("./components/Items/ItemForm"));
const ItemDetails = lazy(() => import("./components/Items/ItemDetails"));
const InvoiceList = lazy(() => import("./components/Invoices/InvoiceList"));
const InvoiceForm = lazy(() => import("./components/Invoices/InvoiceForm"));
const InvoicePreview = lazy(
  () => import("./components/Invoices/InvoicePreview"),
);
const InvoiceEmailCompose = lazy(
  () => import("./components/Invoices/InvoiceEmailCompose"),
);
const PaymentList = lazy(() => import("./components/Payments/PaymentList"));
const AddPaymentPage = lazy(() => import("./components/Payments/PaymentForm"));
const PaymentPreview = lazy(
  () => import("./components/Payments/PaymentPreview"),
);
const PaymentEmailCompose = lazy(
  () => import("./components/Payments/PaymentEmailCompose"),
);
const TemplateList = lazy(() => import("./components/Templates/TemplateList"));
const TemplateForm = lazy(() => import("./components/Templates/TemplateForm"));
const ProfilePage = lazy(() => import("./components/profile/Profile"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <LoadingSpinner size="lg" />
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path="/"
                element={<DashboardMain activeTab="0" onTabChange={() => {}} />}
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
              <Route
                path="/invoices/preview/:id"
                element={<InvoicePreview />}
              />
              <Route path="/invoices/edit/:id" element={<InvoiceForm />} />
              <Route
                path="/invoices/:id/email"
                element={<InvoiceEmailCompose />}
              />

              <Route path="/quotes" element={<ComingSoon title="Quotes" />} />
              <Route
                path="/sales-receipts"
                element={<ComingSoon title="Sales Receipts" />}
              />

              <Route path="/payments" element={<PaymentList />} />
              <Route path="/payments/new" element={<AddPaymentPage />} />
              <Route
                path="/payments/preview/:id"
                element={<PaymentPreview />}
              />
              <Route path="/payments/edit/:id" element={<AddPaymentPage />} />
              <Route
                path="/payments/:id/email"
                element={<PaymentEmailCompose />}
              />

              <Route path="/templates" element={<TemplateList />} />
              <Route path="/templates/new" element={<TemplateForm />} />
              <Route path="/templates/edit/:id" element={<TemplateForm />} />

              <Route path="/profile" element={<ProfilePage />} />

              <Route
                path="/expenses"
                element={<ComingSoon title="Expenses" />}
              />
              <Route
                path="/time-tracking"
                element={<ComingSoon title="Time Tracking" />}
              />
              <Route path="/reports" element={<ComingSoon title="Reports" />} />

              <Route path="*" element={<ComingSoon title="404" />} />
            </Routes>
          </Suspense>
        </Layout>
      </AuthWrapper>
    </BrowserRouter>
  );
};

export default App;

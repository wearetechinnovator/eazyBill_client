import React, { Suspense, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ProtectRoute, UnProtectRoute } from "./components/ProtectRoute";
import ProtectCP from "./components/ProtectCP";

const Login = React.lazy(() => import("./pages/Auth/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const AddQuotation = React.lazy(() => import("./pages/Quotation/AddQuotation"));
const Quotation = React.lazy(() => import("./pages/Quotation/Quotation"));
const Profile = React.lazy(() => import("./pages/Auth/Profile"));
const Signup = React.lazy(() => import("./pages/Auth/Signup"));
const Accounts = React.lazy(() => import("./pages/Accounts/Accounts"));
const AddAccount = React.lazy(() => import("./pages/Accounts/AddAccount"));
const Setting = React.lazy(() => import("./pages/Setting"));
const Party = React.lazy(() => import("./pages/Party/Party"));
const AddParty = React.lazy(() => import('./pages/Party/AddParty'));
const TransactionAdd = React.lazy(() => import("./pages/Transactions/TransactionAdd"));
const Transaction = React.lazy(() => import("./pages/Transactions/Transaction"));
const UnitAdd = React.lazy(() => import("./pages/Unit/UnitAdd"));
const Unit = React.lazy(() => import("./pages/Unit/Unit"));
const Tax = React.lazy(() => import("./pages/Tax/Tax"));
const TaxAdd = React.lazy(() => import("./pages/Tax/TaxAdd"));
const CategoryAdd = React.lazy(() => import("./pages/Item/CategoryAdd"));
const Category = React.lazy(() => import("./pages/Item/Category"));
const ItemAdd = React.lazy(() => import("./pages/Items/ItemAdd"));
const Item = React.lazy(() => import("./pages/Items/Item"));
const RoleAdd = React.lazy(() => import("./pages/Role/RoleAdd"));
const Role = React.lazy(() => import("./pages/Role/Role"));
const AddCompany = React.lazy(() => import("./pages/Company/AddCompany"));
const UserProfileAdd = React.lazy(() => import("./pages/UserProfile/UserProfileAdd"));
const UserProfile = React.lazy(() => import("./pages/UserProfile/UserProfile"));
const Forgot = React.lazy(() => import("./pages/Auth/Forgot"));
const Otp = React.lazy(() => import("./pages/Auth/Otp"));
const ChangePassword = React.lazy(() => import("./pages/Auth/ChangePassword"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Invoice = React.lazy(() => import("./pages/Details/Invoice"));
const AddPaymentOut = React.lazy(() => import("./pages/PaymentOut/AddPayment"));
const AddPaymentIn = React.lazy(() => import("./pages/PaymentIn/AddPayment"));
const PaymentIn = React.lazy(() => import("./pages/PaymentIn/PaymentIn"));
const PaymentOut = React.lazy(() => import("./pages/PaymentOut/PaymentOut"));
const AddProforma = React.lazy(() => import("./pages/Proforma/AddProforma"));
const Proforma = React.lazy(() => import("./pages/Proforma/Proforma"));
const Po = React.lazy(() => import("./pages/PO/Po"));
const AddPo = React.lazy(() => import("./pages/PO/AddPo"));
const PurchaseInvoice = React.lazy(() => import("./pages/PurchaseInvoice/PurchaseInvoice"));
const AddPurchaseInvoice = React.lazy(() => import("./pages/PurchaseInvoice/AddPurchaseInvoice"));
const PurchaseReturn = React.lazy(() => import("./pages/PurchaseReturn/PurchaseReturn"));
const AddPurchaseReturn = React.lazy(() => import("./pages/PurchaseReturn/AddPurchaseReturn"));
const DebitNote = React.lazy(() => import("./pages/DebitNote/DebitNote"));
const AddDebitNote = React.lazy(() => import("./pages/DebitNote/AddDebitNote"));
const SalesInvoice = React.lazy(() => import("./pages/SalesInvoice/SalesInvoice"));
const AddSalesInvoice = React.lazy(() => import("./pages/SalesInvoice/AddSalesInvoice"));
const SalesReturn = React.lazy(() => import("./pages/SalesReturn/SalesReturn"));
const AddSalesReturn = React.lazy(() => import("./pages/SalesReturn/AddSalesReturn"));
const CreditNote = React.lazy(() => import("./pages/CreditNote/CreditNote"));
const AddCreditNote = React.lazy(() => import("./pages/CreditNote/AddCreditNote"));
const DeliveryChalan = React.lazy(() => import("./pages/DeliveryChalan/DeliveryChalan"));
const AddDeliveryChalan = React.lazy(() => import("./pages/DeliveryChalan/AddDeliveryChalan"));
const Ladger = React.lazy(() => import("./pages/Party/Ladger"));
const PartyDetails = React.lazy(() => import("./pages/Party/Details"));
const ItemDetails = React.lazy(() => import("./pages/Items/Details"));
const CategoryDetails = React.lazy(() => import("./pages/Item/Details"));
const StaffAttendance = React.lazy(() => import("./pages/StaffAttendance/StaffAttendance"));
const AddStaffAttendance = React.lazy(() => import("./pages/StaffAttendance/AddStaffAttendance"));
const AttendanceDetails = React.lazy(() => import("./pages/StaffAttendance/AttendanceDetails"));
const SalarySlip = React.lazy(() => import("./pages/StaffAttendance/SalarySlip"));
const Enquiry = React.lazy(() => import("./pages/Enquiry/Enquiry"));
const AddEnquiry = React.lazy(() => import("./pages/Enquiry/AddEnquiry"));


// Reports
const DayBook = React.lazy(() => import("./pages/Report/DayBook"));
const PartyStatement = React.lazy(() => import("./pages/Report/PartyStatement"));


const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        navigate(-1);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);


  return (
    <Suspense fallback={<div className="grid place-items-center w-full min-h-[100vh]">
      <div className="flex flex-row gap-2">
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>}>
      <Routes>
        <Route path="/admin" element={<UnProtectRoute login={true}><Login /></UnProtectRoute>} />
        <Route path="/" element={<UnProtectRoute login={true}><Login /></UnProtectRoute>} />
        <Route path="/admin/signup" element={<UnProtectRoute login={true}><Signup /></UnProtectRoute>} />
        <Route path="/admin/forget" element={<UnProtectRoute login={true}>< Forgot /></UnProtectRoute>} />
        <Route path="/admin/otp" element={<UnProtectRoute login={true}>< Otp /></UnProtectRoute>} />
        <Route path="/admin/change-password" element={<ProtectCP>< ChangePassword /></ProtectCP>} />
        <Route path="/admin/site" element={<ProtectRoute><Setting /></ProtectRoute>} />
        <Route path="/admin/company" element={<ProtectRoute><AddCompany /></ProtectRoute>} />
        <Route path="admin/dashboard" element={<ProtectRoute><Dashboard /></ProtectRoute>} />

        {/* Print part */}
        <Route path="/admin/bill/details/:bill/:id" element={<ProtectRoute><Invoice /></ProtectRoute>} />


        {/* Quotatin route */}
        <Route path="/admin/quotation-estimate" element={<ProtectRoute><Quotation /></ProtectRoute>} />
        <Route path="/admin/quotation-estimate/add/:id?" element={<ProtectRoute><AddQuotation /></ProtectRoute>} />
        <Route path="/admin/quotation-estimate/edit/:id" element={<ProtectRoute><AddQuotation mode={"edit"} /></ProtectRoute>} />


        {/* Proforma route */}
        <Route path="/admin/proforma-invoice" element={<ProtectRoute><Proforma /></ProtectRoute>} />
        <Route path="/admin/proforma-invoice/add/:id?" element={<ProtectRoute><AddProforma /></ProtectRoute>} />
        <Route path="/admin/proforma-invoice/convert/add/:id" element={<ProtectRoute><AddProforma mode={'convert'} /></ProtectRoute>} />
        <Route path="/admin/proforma-invoice/edit/:id" element={<ProtectRoute><AddProforma mode={"edit"} /></ProtectRoute>} />


        {/* PO route */}
        <Route path="/admin/purchase-order" element={<ProtectRoute><Po /></ProtectRoute>} />
        <Route path="/admin/purchase-order/add/:id?" element={<ProtectRoute><AddPo /></ProtectRoute>} />
        <Route path="/admin/purchase-order/edit/:id" element={<ProtectRoute><AddPo mode={"edit"} /></ProtectRoute>} />


        {/* Purchase Invoice route */}
        <Route path="/admin/purchase-invoice" element={<ProtectRoute><PurchaseInvoice /></ProtectRoute>} />
        <Route path="/admin/purchase-invoice/add/:id?" element={<ProtectRoute><AddPurchaseInvoice /></ProtectRoute>} />
        <Route path="/admin/purchase-invoice/convert/add/:id" element={<ProtectRoute><AddPurchaseInvoice mode={"convert"} /></ProtectRoute>} />
        <Route path="/admin/purchase-invoice/edit/:id" element={<ProtectRoute><AddPurchaseInvoice mode={"edit"} /></ProtectRoute>} />


        {/* Purchase Return route */}
        <Route path="/admin/purchase-return" element={<ProtectRoute><PurchaseReturn /></ProtectRoute>} />
        <Route path="/admin/purchase-return/add/:id?" element={<ProtectRoute><AddPurchaseReturn /></ProtectRoute>} />
        <Route path="/admin/purchase-return/edit/:id" element={<ProtectRoute><AddPurchaseReturn mode={"edit"} /></ProtectRoute>} />


        {/* Debit Note route */}
        <Route path="/admin/debit-note" element={<ProtectRoute><DebitNote /></ProtectRoute>} />
        <Route path="/admin/debit-note/add/:id?" element={<ProtectRoute><AddDebitNote /></ProtectRoute>} />
        <Route path="/admin/debit-note/edit/:id" element={<ProtectRoute><AddDebitNote mode={"edit"} /></ProtectRoute>} />


        {/* Sales Invoice route */}
        <Route path="/admin/sales-invoice" element={<ProtectRoute><SalesInvoice /></ProtectRoute>} />
        <Route path="/admin/sales-invoice/add/:id?" element={<ProtectRoute><AddSalesInvoice /></ProtectRoute>} />
        <Route path="/admin/sales-invoice/convert/add/:id" element={<ProtectRoute><AddSalesInvoice mode={"convert"} /></ProtectRoute>} />
        <Route path="/admin/sales-invoice/edit/:id" element={<ProtectRoute><AddSalesInvoice mode={"edit"} /></ProtectRoute>} />


        {/* Sales Return route */}
        <Route path="/admin/sales-return" element={<ProtectRoute><SalesReturn /></ProtectRoute>} />
        <Route path="/admin/sales-return/add/:id?" element={<ProtectRoute><AddSalesReturn /></ProtectRoute>} />
        <Route path="/admin/sales-return/edit/:id" element={<ProtectRoute><AddSalesReturn mode={"edit"} /></ProtectRoute>} />


        {/* Credit Note route */}
        <Route path="/admin/credit-note" element={<ProtectRoute><CreditNote /></ProtectRoute>} />
        <Route path="/admin/credit-note/add/:id?" element={<ProtectRoute><AddCreditNote /></ProtectRoute>} />
        <Route path="/admin/credit-note/edit/:id" element={<ProtectRoute><AddCreditNote mode={"edit"} /></ProtectRoute>} />


        {/* Delivery Chalan route */}
        <Route path="/admin/delivery-chalan" element={<ProtectRoute><DeliveryChalan /></ProtectRoute>} />
        <Route path="/admin/delivery-chalan/add/:id?" element={<ProtectRoute><AddDeliveryChalan /></ProtectRoute>} />
        <Route path="/admin/delivery-chalan/edit/:id" element={<ProtectRoute><AddDeliveryChalan mode={"edit"} /></ProtectRoute>} />



        <Route path="/admin/profile" element={<ProtectRoute><Profile /></ProtectRoute>} />

        {/* Account */}
        <Route path="/admin/account/add" element={<ProtectRoute><AddAccount /></ProtectRoute>} />
        <Route path="/admin/account/edit/:id" element={<ProtectRoute><AddAccount mode="edit" /></ProtectRoute>} />
        <Route path="admin/account" element={<ProtectRoute><Accounts /></ProtectRoute>} />

        <Route path="/admin/enquiry" element={<ProtectRoute><Enquiry /></ProtectRoute>} />
        <Route path="/admin/enquiry/add" element={<ProtectRoute><AddEnquiry /></ProtectRoute>} />
        <Route path="/admin/enquiry/edit/:id" element={<ProtectRoute><AddEnquiry mode={"edit"} /></ProtectRoute>} />

        <Route path="/admin/party" element={<ProtectRoute><Party /></ProtectRoute>} />
        <Route path="/admin/party/add" element={<ProtectRoute><AddParty /></ProtectRoute>} />
        <Route path="/admin/party/edit/:id" element={<ProtectRoute><AddParty mode={"edit"} /></ProtectRoute>} />
        <Route path="/admin/party/details/:id" element={<ProtectRoute><PartyDetails /></ProtectRoute>} />

        <Route path="admin/other-transaction/add" element={<ProtectRoute><TransactionAdd /></ProtectRoute>} />
        <Route path="admin/other-transaction/edit/:id" element={<ProtectRoute><TransactionAdd mode="edit" /></ProtectRoute>} />
        <Route path="admin/other-transaction" element={<ProtectRoute><Transaction /></ProtectRoute>} />

        <Route path="/admin/unit" element={<ProtectRoute><Unit /></ProtectRoute>} />
        <Route path="admin/unit/add" element={<ProtectRoute><UnitAdd /></ProtectRoute>} />
        <Route path="admin/unit/edit/:id" element={<ProtectRoute><UnitAdd mode="edit" /></ProtectRoute>} />


        <Route path="/admin/other-transaction/add" element={<ProtectRoute><TransactionAdd /></ProtectRoute>} />
        <Route path="/admin/other-transaction/edit" element={<ProtectRoute><TransactionAdd mode="edit" /></ProtectRoute>} />
        <Route path="/admin/other-transaction" element={<ProtectRoute><Transaction /></ProtectRoute>} />

        <Route path="/admin/tax/add" element={<ProtectRoute><TaxAdd /></ProtectRoute>} />
        <Route path="/admin/tax/edit/:id" element={<ProtectRoute><TaxAdd mode="edit" /></ProtectRoute>} />
        <Route path="/admin/tax" element={<ProtectRoute><Tax /></ProtectRoute>} />

        <Route path="/admin/item-category/add" element={<ProtectRoute>< CategoryAdd /></ProtectRoute>} />
        <Route path="/admin/item-category/edit/:id" element={<ProtectRoute>< CategoryAdd mode="edit" /></ProtectRoute>} />
        <Route path="/admin/item-category" element={<ProtectRoute><Category /></ProtectRoute>} />
        <Route path="/admin/item-category/details/:id" element={<ProtectRoute><CategoryDetails /></ProtectRoute>} />


        <Route path="/admin/item/add" element={<ProtectRoute><ItemAdd /></ProtectRoute>} />
        <Route path="/admin/item/edit/:id" element={<ProtectRoute><ItemAdd mode="edit" /></ProtectRoute>} />
        <Route path="/admin/item" element={<ProtectRoute><Item /></ProtectRoute>} />
        <Route path="/admin/item/details/:id" element={<ProtectRoute><ItemDetails /></ProtectRoute>} />


        <Route path="/admin/role/add" element={<ProtectRoute><RoleAdd /></ProtectRoute>} />
        <Route path="/admin/role/edit" element={<ProtectRoute><RoleAdd mode="edit" /></ProtectRoute>} />
        <Route path="/admin/role" element={<ProtectRoute> <Role /> </ProtectRoute>} />
        <Route path="/admin/user-profile/add" element={<ProtectRoute> < UserProfileAdd /></ProtectRoute>} />
        <Route path="/admin/user-profile/edit" element={<ProtectRoute> < UserProfileAdd mode="edit" /></ProtectRoute>} />
        <Route path="/admin/user-profile" element={<ProtectRoute><UserProfile /></ProtectRoute>} />

        <Route path="/admin/payment-out/add" element={<ProtectRoute><AddPaymentOut /></ProtectRoute>} />
        <Route path="/admin/payment-out/edit/:id" element={<ProtectRoute><AddPaymentOut mode={"edit"} /></ProtectRoute>} />
        <Route path="/admin/payment-out" element={<ProtectRoute><PaymentOut /></ProtectRoute>} />

        <Route path="/admin/payment-in/add" element={<ProtectRoute><AddPaymentIn /></ProtectRoute>} />
        <Route path="/admin/payment-in/edit/:id" element={<ProtectRoute><AddPaymentIn mode={"edit"} /></ProtectRoute>} />
        <Route path="/admin/payment-in" element={<ProtectRoute><PaymentIn /></ProtectRoute>} />

        <Route path="/admin/staff-attendance" element={<ProtectRoute><StaffAttendance /></ProtectRoute>} />
        <Route path="/admin/staff-attendance/add" element={<ProtectRoute><AddStaffAttendance /></ProtectRoute>} />
        <Route path="/admin/staff-attendance/edit/:id" element={<ProtectRoute><AddStaffAttendance mode="edit" /></ProtectRoute>} />
        <Route path="/admin/staff-attendance/details/:id" element={<ProtectRoute><AttendanceDetails /></ProtectRoute>} />
        <Route path="/admin/staff-attendance/salary-slip" element={<ProtectRoute><SalarySlip /></ProtectRoute>} />


        {/* ============================[Reports]======================= */}
        {/* ============================================================ */}
        <Route path="/report/daybook" element={<ProtectRoute><DayBook /></ProtectRoute >} />
        <Route path="/report/party-statement" element={<ProtectRoute><PartyStatement /></ProtectRoute >} />


        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>

  )
}

export default App;

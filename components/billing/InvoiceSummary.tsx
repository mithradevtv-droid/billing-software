"use client";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  gst_rate: number;
  total: number;
}

interface Customer {
  id: number;
  name: string;
  state: string;
  gstin: string;
}

interface InvoiceSummaryProps {
  cartItems: CartItem[];
  selectedCustomer: Customer | null;
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<any>>;
}

export default function InvoiceSummary({
  cartItems,
  selectedCustomer,
  setCartItems,
  setSelectedCustomer,
}: InvoiceSummaryProps) {
  const shopState = "Maharashtra";

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  let totalGST = 0;

  cartItems.forEach((item) => {
    totalGST += item.total * (item.gst_rate / 100);
  });

  const isSameState =
    selectedCustomer &&
    selectedCustomer.state.toLowerCase() ===
      shopState.toLowerCase();

  const cgst = isSameState ? totalGST / 2 : 0;
  const sgst = isSameState ? totalGST / 2 : 0;
  const igst = !isSameState ? totalGST : 0;

  const grandTotal = subtotal + totalGST;

  async function generateInvoice() {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const invoiceNumber =
        "INV-" + Date.now();

      const response = await fetch(
        "/api/invoices",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            invoiceNumber,
            customerId: selectedCustomer.id,
            customerName:
              selectedCustomer.name,
            customerState:
              selectedCustomer.state,
            customerGstin:
              selectedCustomer.gstin,

            date: new Date()
              .toISOString()
              .split("T")[0],

            due_date: null,

            subtotal,
            discount: 0,

            cgst,
            sgst,
            igst,

            total: grandTotal,

            status: "Paid",
            notes: "",

            items: cartItems.map(
              (item) => ({
                product_id: item.id,
                name: item.name,
                quantity:
                  item.quantity,
                price: item.price,
                gstRate:
                  item.gst_rate,
                discountPct: 0,
                cgst: 0,
                sgst: 0,
                igst: 0,
                total: item.total,
              })
            ),
          }),
        }
      );

      const result =
        await response.json();

      if (result.success) {
        alert(
          `Invoice ${invoiceNumber} created successfully`
        );

        setCartItems([]);
        setSelectedCustomer(null);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create invoice");
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">
        Invoice Summary
      </h2>

      <div className="space-y-2">
        <div>
          Subtotal: ₹{subtotal.toFixed(2)}
        </div>

        <div>
          CGST: ₹{cgst.toFixed(2)}
        </div>

        <div>
          SGST: ₹{sgst.toFixed(2)}
        </div>

        <div>
          IGST: ₹{igst.toFixed(2)}
        </div>

        <div className="text-lg font-bold">
          Grand Total:
          ₹{grandTotal.toFixed(2)}
        </div>

        <button
          onClick={generateInvoice}
          className="mt-4 rounded bg-green-600 px-4 py-2 text-white"
        >
          Generate Invoice
        </button>
      </div>
    </div>
  );
}
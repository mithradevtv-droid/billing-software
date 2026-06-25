"use client";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  gst_rate: number;
  total: number;
}

interface InvoiceCartProps {
  cartItems: CartItem[];
}

export default function InvoiceCart({
  cartItems,
}: InvoiceCartProps) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">
        Invoice Cart
      </h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Product</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">GST</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>

        <tbody>
          {cartItems.length === 0 ? (
            <tr>
              <td className="border p-2">
                No items added
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">-</td>
              <td className="border p-2">-</td>
                <td className="border p-2">-</td>
            </tr>
          ) : (
            cartItems.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">
                  {item.name}
                </td>
                <td className="border p-2">
                  {item.quantity}
                </td>
                <td className="border p-2">
                  ₹{item.price}
                </td>
                 <td className="border p-2">
                      {item.gst_rate}%
                </td>
                <td className="border p-2">
                  ₹{item.total}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
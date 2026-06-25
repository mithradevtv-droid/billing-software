export async function getCustomers() {
  const response = await fetch("/api/customers");

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}
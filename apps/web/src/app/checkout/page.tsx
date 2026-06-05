import { CheckoutPageContent } from "@/components/Checkout/CheckoutPageContent";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CUSTOMER") {
    redirect("/auth?next=/checkout");
  }

  return (
    <AppLayout>
      <CheckoutPageContent customerName={user.name} customerEmail={user.email} />
    </AppLayout>
  );
}

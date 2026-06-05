import { OrderConfirmationContent } from "@/components/Checkout/OrderConfirmationContent";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function OrderConfirmationPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CUSTOMER") {
    redirect("/auth?next=/order-confirmation");
  }

  return (
    <AppLayout>
      <OrderConfirmationContent />
    </AppLayout>
  );
}

import { CartPageContent } from "@/components/Cart/CartPageContent";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "CUSTOMER") {
    redirect("/auth?next=/cart");
  }

  // The cart UI is client-side, but it still uses the shared storefront layout and navigation.
  return (
    <AppLayout>
      <CartPageContent />
    </AppLayout>
  );
}

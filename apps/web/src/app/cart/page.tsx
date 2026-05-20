import { CartPageContent } from "@/components/Cart/CartPageContent";
import { AppLayout } from "@/components/Layout/AppLayout";

export default function CartPage() {
  // The cart UI is client-side, but it still uses the shared storefront layout and navigation.
  return (
    <AppLayout>
      <CartPageContent />
    </AppLayout>
  );
}

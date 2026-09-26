import { redirect } from 'next/navigation';

/** The account page became the cart. Kept as a redirect so old links still land. */
export default function AccountPage() {
  redirect('/cart');
}

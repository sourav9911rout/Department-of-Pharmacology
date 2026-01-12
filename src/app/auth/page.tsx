
import { redirect } from 'next/navigation';

export default function AuthPage() {
  // This page is no longer needed with the custom OTP flow.
  // Redirect users to the main login page if they land here.
  redirect('/login');
}

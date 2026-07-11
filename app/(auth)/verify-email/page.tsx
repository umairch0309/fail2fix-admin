import { redirect } from "next/navigation";

// Admin panel does not require email verification
// Admin accounts are pre-verified
const VerifyEmail = () => {
  redirect("/login");
};

export default VerifyEmail;

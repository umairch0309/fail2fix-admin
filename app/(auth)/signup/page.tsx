import { redirect } from "next/navigation";

// Admin panel does not support self-signup
// Admins are created manually in the database
const Signup = () => {
  redirect("/login");
};

export default Signup;

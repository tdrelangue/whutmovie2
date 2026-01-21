import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import LoginForm from "./login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Admin Login - WhutMovie",
};

export default async function AdminLoginPage({ searchParams }) {
  // If already logged in, redirect to admin dashboard
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/admin");
  }

  const params = await searchParams;
  const redirectTo = params.redirect || "/admin";

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </div>
  );
}

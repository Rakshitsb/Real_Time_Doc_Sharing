import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import PageTransition from "../components/common/PageTransition";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ROUTES } from "../constants/routes";
import PublicLayout from "../layouts/PublicLayout";
import { register } from "../services/authService";
import getErrorMessage from "../utils/getErrorMessage";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      navigate(ROUTES.LOGIN);
    } catch (registerError) {
      setError(getErrorMessage(registerError, "Unable to register"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <main className="flex min-h-screen items-center justify-center px-4 pt-20">
        <PageTransition className="w-full max-w-md">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-2xl">Create your workspace</CardTitle>
              <CardDescription>Set up your account and start organizing shared documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleRegister}>
                <ErrorMessage message={error} />
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Create password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Register"}
                </Button>
              </form>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link className="font-medium text-foreground underline-offset-4 hover:underline" to={ROUTES.LOGIN}>
                  Login
                </Link>
              </p>
            </CardContent>
          </Card>
        </PageTransition>
      </main>
    </PublicLayout>
  );
}

export default RegisterPage;

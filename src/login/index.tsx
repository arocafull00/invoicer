import React, { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GitHubIcon } from "@/shared/components/icons/GithubIcon";
import logoImage from "@/assets/logo.png";
import { GoogleIcon } from "@/shared/components/icons/GoogleIcon";
import LoginBackground from "./components/LoginBackground";

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signInWithGoogle, signInWithGithub } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithGithub();
      if (error) {
        setError(error.message);
      }
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <LoginBackground>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6">
              <img
                src={logoImage}
                alt="Invoicer Logo"
                className="w-16 h-16 mx-auto mb-4"
              />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Iniciar sesión
            </h2>
            <p className="text-muted-foreground">
              Continúa con tu cuenta de Google o GitHub
            </p>
          </div>

          <Card className="p-6">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              disabled={loading}
              className="w-full mb-2"
            >
              <GoogleIcon className="w-4 h-4 mr-2" />
              Google
            </Button>
            <Button
              onClick={handleGithubSignIn}
              variant="outline"
              disabled={loading}
              className="w-full"
            >
              <GitHubIcon className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            {loading && (
              <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                Redirigiendo…
              </div>
            )}
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Al hacer clic en continuar, aceptas nuestros{" "}
              <a href="/terms" className="text-primary hover:underline">
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      </LoginBackground>
    </div>
  );
};

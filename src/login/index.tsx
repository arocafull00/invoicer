import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GitHubIcon } from "@/shared/components/icons/GithubIcon";
import logoImage from "@/assets/logo.png";
import { GoogleIcon } from "@/shared/components/icons/GoogleIcon";
import LoginBackground from "./components/LoginBackground";

export const LoginPage: React.FC = () => {
  const [isSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signUp, signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <LoginBackground>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6">
              <img
                src={logoImage}
                alt="Invoicer Logo"
                className="w-16 h-16 mx-auto mb-4"
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
            </h2>
            <p className="text-[#A1A1AA]">
              {isSignUp
                ? "Ingresa tu email para crear tu cuenta"
                : "Ingresa tus credenciales para acceder"}
            </p>
          </div>

          <Card className="p-6  ">
            {/* Email Input */}
            <div className="mb-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="bg-[#0D0D0D] border-[#FFFFFF14] text-white placeholder:text-[#A1A1AA]"
              />
            </div>

            {!isSignUp && (
              <div className="mb-6">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-[#0D0D0D] border-[#FFFFFF14] text-white placeholder:text-[#A1A1AA]"
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={isSignUp ? handleGoogleSignIn : handleSubmit}
              disabled={loading}
              className="w-full bg-[#7F5AF0] text-white hover:bg-[#654DD4] mb-4"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isSignUp ? "Creando cuenta..." : "Iniciando sesión..."}
                </div>
              ) : isSignUp ? (
                "Registrarse con Email"
              ) : (
                "Iniciar sesión con Email"
              )}
            </Button>

            {/* Divider */}
            <div className="my-4 flex items-center justify-center gap-4 overflow-hidden">
              <Separator className="w-20 bg-[#FFFFFF14]" />
              <span className="text-xs text-[#A1A1AA] whitespace-nowrap">
                O CONTINÚA CON
              </span>
              <Separator className="w-20 bg-[#FFFFFF14]" />
            </div>

            {/* GitHub Button */}
            <Button
              onClick={handleGithubSignIn}
              variant="outline"
              disabled={loading}
              className="w-full bg-[#0D0D0D] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]"
            >
              <GitHubIcon className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              disabled={loading}
              className="w-full bg-[#0D0D0D] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]"
            >
              <GoogleIcon className="w-4 h-4 mr-2" />
              Google
            </Button>
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#A1A1AA]">
              Al hacer clic en continuar, aceptas nuestros{" "}
              <a href="/terms" className="text-[#7F5AF0] hover:underline">
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a href="/privacy" className="text-[#7F5AF0] hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      </LoginBackground>
    </div>
  );
};

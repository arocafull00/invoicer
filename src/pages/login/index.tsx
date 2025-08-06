import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Github } from 'lucide-react';
import logoImage from '@/assets/logo.png';

export const LoginPage: React.FC = () => {
  const [isSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#7F5AF0] to-[#654DD4] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center text-white px-8">
          <div className="mb-8">
            <img 
              src={logoImage} 
              alt="Invoicer Logo" 
              className="w-24 h-24 mx-auto mb-6 drop-shadow-2xl"
            />
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Invoicer</h1>
            <p className="text-xl opacity-90 max-w-md mx-auto leading-relaxed">
              Gestiona tus facturas de manera profesional y eficiente
            </p>
          </div>
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-sm italic opacity-80">
              "Esta herramienta ha revolucionado la forma en que gestiono mis facturas. 
              Ahora todo es más rápido y profesional."
            </p>
            <p className="text-sm font-medium mt-2 opacity-90">- Usuario satisfecho</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
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
              {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </h2>
            <p className="text-[#A1A1AA]">
              {isSignUp 
                ? 'Ingresa tu email para crear tu cuenta'
                : 'Ingresa tus credenciales para acceder'
              }
            </p>
          </div>

          <Card className="p-6 bg-[#FFFFFF14] border-[#FFFFFF14]">
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
                  {isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}
                </div>
              ) : (
                isSignUp ? 'Registrarse con Email' : 'Iniciar sesión con Email'
              )}
            </Button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#FFFFFF14]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#FFFFFF14] text-[#A1A1AA]">O CONTINÚA CON</span>
              </div>
            </div>

            {/* GitHub Button */}
            <Button 
              onClick={handleGoogleSignIn}
              variant="outline"
              disabled={loading}
              className="w-full bg-[#0D0D0D] border-[#FFFFFF14] text-white hover:bg-[#FFFFFF1A]"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
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
              Al hacer clic en continuar, aceptas nuestros{' '}
              <a href="#" className="text-[#7F5AF0] hover:underline">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-[#7F5AF0] hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Background } from '@/shared/components/Background';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <Background>
      <div className="min-h-screen w-full flex items-start justify-center py-12 px-4 md:px-6">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidad</h1>
          <p className="text-sm text-[#A1A1AA] mb-6">Última actualización: {new Date().toLocaleDateString()}</p>
          <Card className="p-6 md:p-8   space-y-6">
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">1. Introducción</h2>
              <p className="text-[#E4E4E7]">
                Tu privacidad es importante para nosotros. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información cuando utilizas Invoicer.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">2. Información que recopilamos</h2>
              <p className="text-[#E4E4E7]">
                Recopilamos información que nos proporcionas (como nombre y correo electrónico), información de uso (como páginas visitadas) y, cuando corresponde, datos necesarios para la facturación.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">3. Cómo usamos la información</h2>
              <p className="text-[#E4E4E7]">
                Utilizamos tus datos para operar y mejorar Invoicer, proporcionar soporte, cumplir obligaciones legales y, si lo autorizas, enviarte comunicaciones relevantes.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">4. Compartición de datos</h2>
              <p className="text-[#E4E4E7]">
                No vendemos tu información. Podemos compartir datos con proveedores que nos ayudan a prestar el servicio, bajo acuerdos de confidencialidad y seguridad apropiados.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">5. Seguridad</h2>
              <p className="text-[#E4E4E7]">
                Implementamos medidas técnicas y organizativas para proteger tus datos. Sin embargo, ningún método de transmisión o almacenamiento es 100% seguro.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">6. Tus derechos</h2>
              <p className="text-[#E4E4E7]">
                Puedes acceder, corregir o eliminar tus datos, así como oponerte o limitar ciertos tratamientos, según lo permita la ley aplicable.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">7. Contacto</h2>
              <p className="text-[#E4E4E7]">
                Para consultas sobre esta Política de Privacidad, contáctanos en <span className="text-[#7F5AF0]">privacidad@invoicer.app</span>.
              </p>
            </section>
          </Card>
        </div>
      </div>
    </Background>
  );
};



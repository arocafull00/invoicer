import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Background } from '@/shared/components/Background';

export const TermsOfServicePage: React.FC = () => {
  return (
    <Background>
      <div className="min-h-screen w-full flex items-start justify-center py-12 px-4 md:px-6">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-white mb-2">Términos de Servicio</h1>
          <p className="text-sm text-[#A1A1AA] mb-6">Última actualización: {new Date().toLocaleDateString()}</p>
          <Card className="p-6 md:p-8   space-y-6">
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">1. Aceptación de los Términos</h2>
              <p className="text-[#E4E4E7]">
                Al acceder o utilizar Invoicer, aceptas cumplir estos Términos de Servicio. Si no estás de acuerdo con alguna parte, no utilices el servicio.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">2. Uso del Servicio</h2>
              <p className="text-[#E4E4E7]">
                Puedes utilizar Invoicer para crear, gestionar y enviar facturas. Te comprometes a usar el servicio de conformidad con las leyes aplicables y a no realizar actividades que puedan perjudicar a Invoicer o a otros usuarios.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">3. Cuentas</h2>
              <p className="text-[#E4E4E7]">
                Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas bajo tu cuenta. Notifícanos inmediatamente cualquier uso no autorizado.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">4. Facturación y Pagos</h2>
              <p className="text-[#E4E4E7]">
                Algunos servicios pueden requerir pagos. Los cargos, si corresponden, se comunicarán claramente y podrán cambiar con previo aviso. Los impuestos aplicables pueden añadirse según la jurisdicción.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">5. Propiedad Intelectual</h2>
              <p className="text-[#E4E4E7]">
                Invoicer y su contenido (marca, software, interfaces) están protegidos por derechos de propiedad intelectual. No se concede ninguna licencia salvo las necesarias para usar el servicio conforme a estos términos.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">6. Limitación de Responsabilidad</h2>
              <p className="text-[#E4E4E7]">
                En la medida permitida por la ley, Invoicer no será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por pérdida de beneficios o datos derivados del uso del servicio.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">7. Modificaciones del Servicio y de los Términos</h2>
              <p className="text-[#E4E4E7]">
                Podemos actualizar el servicio y estos términos periódicamente. Publicaremos cualquier cambio significativo. El uso continuado del servicio tras los cambios implica su aceptación.
              </p>
            </section>

            <Separator className="bg-[#FFFFFF14]" />

            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-white">8. Contacto</h2>
              <p className="text-[#E4E4E7]">
                Si tienes preguntas sobre estos Términos de Servicio, contáctanos en <span className="text-[#7F5AF0]">adrianrocafull1@gmail.com</span>.
              </p>
            </section>
          </Card>
        </div>
      </div>
    </Background>
  );
};



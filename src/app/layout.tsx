import type { Metadata } from "next";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema de Talleres - Gestión Integral",
  description: "Sistema web integral para gestión de talleres",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-50">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}

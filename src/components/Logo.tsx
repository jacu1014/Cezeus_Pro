import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Círculo de fondo que brilla con tu color primario */}
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
      
      {/* Silueta simplificada del futbolista (puedes reemplazar el src por tu imagen real luego) */}
      <img 
        src="/Logo_Cezeus.jpeg" 
        alt="Logo Cezeus" 
        className="relative z-10 w-full h-full object-contain"
        onError={(e) => {
          // Si no encuentra la imagen, muestra un icono genérico de fútbol
          e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/53/53283.png";
        }}
      />
    </div>
  );
};

export default Logo;
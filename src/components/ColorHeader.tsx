"use client";

import React from "react";

type ColorHeaderProps = {
  title: string;
  subtitle?: string;
  gradientFrom?: string;
  gradientTo?: string;
};

const ColorHeader: React.FC<ColorHeaderProps> = ({
  title,
  subtitle,
  gradientFrom = "#93c5fd",
  gradientTo = "#f472b6",
}) => {
  return (
    <div className="text-left">
      <h2
        className="text-2xl md:text-3xl font-display font-bold mb-1"
        style={{
          background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm md:text-base text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
};

export default ColorHeader;
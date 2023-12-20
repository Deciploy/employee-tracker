import React from "react";

interface ErrorTextProps {
  visible: boolean;
  error?: string;
  className?: string;
}

export const ErrorText: React.FC<ErrorTextProps> = ({
  visible,
  error,
  className,
}) => {
  return visible && error ? (
    <div className={`text-warning-500 text-sm mt-1 ${className}`}>{error}</div>
  ) : null;
};

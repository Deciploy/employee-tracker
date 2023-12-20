import React from "react";

interface AlertMessageProps {
  message?: string;
  type: "success" | "error";
}

export const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  type,
}) => {
  const styles = {
    success: "bg-success-100 text-success-500 border-l-4 border-success p-2",
    error: "bg-warning-100 text-warning-500 border-l-4 border-warning p-2",
  };

  if (!message) return null;

  return (
    <div className={styles[type]}>
      <p>{message}</p>
    </div>
  );
};

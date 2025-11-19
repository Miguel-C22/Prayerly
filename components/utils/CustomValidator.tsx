import React from "react";

interface CustomValidatorProps {
  hint: string;
  error: boolean;
}

function CustomValidator({ hint, error }: CustomValidatorProps) {
  return (
    <>
      {error ? <div className="text-red-500 text-sm mt-1">{hint}</div> : null}
    </>
  );
}

export default CustomValidator;

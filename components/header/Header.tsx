import React from "react";

export interface HeaderContent {
  title?: string;
  subtitle?: string;
  customButton?: React.ComponentType;
}

interface HeaderProps {
  headerContent?: HeaderContent;
}

function Header({ headerContent }: HeaderProps) {
  const CustomButton = headerContent?.customButton;

  return (
    <div className="flex flex-wrap gap-2 items-center justify-between px-6 py-4 bg-backgrounds-white border-b border-border-gray mb-8">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-text-grayPrimary">
          {headerContent?.title || "Prayerly"}
        </h1>
        <p className="text-sm text-text-graySecondary mt-1">
          {headerContent?.subtitle || "Your personal prayer companion."}
        </p>
      </div>
      {CustomButton && <CustomButton />}
    </div>
  );
}

export default Header;

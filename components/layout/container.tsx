import type { ContainerProps } from "@/types/common";

const Container = ({ children, className = "" }: ContainerProps) => {
  return (
    <div className={`mx-auto max-w-[90%] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;

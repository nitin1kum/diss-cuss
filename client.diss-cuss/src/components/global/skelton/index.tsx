const Skeleton = ({
  className,
  rounded = "rounded-md",
  children
}: {
  className?: string;
  rounded?: string;
  children?: React.ReactNode
}) => (
  <div
    className={`bg-card shadow-lg animate-[animate-fade-in_infinite_3s_ease-in-out]  
       ${rounded} 
      ${className}`}
  >{children}</div>
);

export default Skeleton;
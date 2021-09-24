type WrapperProps = {
  className?: string;
  children: JSX.Element;
  tooltip: string;
};

export default function SelectionWrapper({
  className = ``,
  tooltip,
  children,
}: WrapperProps) {
  return (
    <div className={`tooltip ${className}`} data-tip={tooltip}>
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black flex justify-center items-center">
        {children}
      </div>
    </div>
  );
}

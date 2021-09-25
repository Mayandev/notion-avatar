type WrapperProps = {
  className?: string;
  children: JSX.Element;
  tooltip: string;
  switchConfig?: () => void;
};

export default function SelectionWrapper({
  className = '',
  tooltip,
  children,
  switchConfig
}: WrapperProps) {
  return (
    <button type="button" role="button" onClick={switchConfig} onKeyDown={switchConfig} className={`tooltip ${className}`} data-tip={tooltip}>
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black flex justify-center items-center">
        {children}
      </div>
    </button>
  );
}

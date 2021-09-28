type WrapperProps = {
  className?: string;
  children: JSX.Element;
  tooltip: string;
  switchConfig?: () => void;
};

export default function SelectionWrapper({
  className = ``,
  tooltip,
  children,
  switchConfig,
}: WrapperProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={switchConfig}
      onKeyDown={switchConfig}
      className={`tooltip ${className} outline-none select-none`}
      data-tip={tooltip}
    >
      <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black flex justify-center items-center">
        {children}
      </div>
    </div>
  );
}

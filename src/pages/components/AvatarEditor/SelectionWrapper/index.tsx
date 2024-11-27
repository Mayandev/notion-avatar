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
      onKeyDown={() => {
        //
      }}
      className={`tooltip ${className} outline-none select-none rounded-lg border-3 border-solid border-black focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-50`}
      data-tip={tooltip}
    >
      <div className="flex w-10 h-10 md:w-14 md:h-14 justify-center items-center">
        {children}
      </div>
    </div>
  );
}

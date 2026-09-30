import Icon from './Icon';
import { cn } from '../utils/cn';

const styles = {
  // light button on dark backgrounds
  light: 'bg-paper text-ink [--fill:#A9B8FF] hover:text-ink',
  // dark button on light backgrounds
  dark: 'bg-ink text-paper [--fill:#2A2C31]',
  outlineLight: 'border border-paper/25 text-paper [--fill:#EEEFF1] hover:text-ink',
  outlineDark: 'border border-ink/20 text-ink [--fill:#0F1012] hover:text-paper',
};

export default function Button({ as: Tag = 'a', variant = 'dark', icon = 'arrow', size = 'md', className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        'btn-fill group inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition-colors duration-300 active:scale-[.98]',
        size === 'lg' ? 'h-14 px-7 text-[15px]' : size === 'sm' ? 'h-10 px-4 text-sm' : 'h-12 px-6 text-[15px]',
        styles[variant], className,
      )}
      {...rest}
    >
      <span>{children}</span>
      {icon ? (
        <span className="relative inline-flex h-[18px] w-[18px] overflow-hidden">
          <Icon name={icon} className="absolute inset-0 transition-transform duration-500 ease-out group-hover:translate-x-5" />
          <Icon name={icon} className="absolute inset-0 -translate-x-5 transition-transform duration-500 ease-out group-hover:translate-x-0" />
        </span>
      ) : null}
    </Tag>
  );
}

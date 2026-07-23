type SidebarUserMenuActionProps = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
};

export function SidebarUserMenuAction({
  label,
  icon: Icon,
  onClick,
}: SidebarUserMenuActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

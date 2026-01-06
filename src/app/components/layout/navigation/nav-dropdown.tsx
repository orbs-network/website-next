export function NavDropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-medium absolute left-0 top-full mt-2 rounded-md border bg-popover p-4 text-popover-foreground shadow-md opacity-0 invisible translate-y-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:visible group-hover:translate-y-[-0.5rem]">
      {children}
    </div>
  )
}

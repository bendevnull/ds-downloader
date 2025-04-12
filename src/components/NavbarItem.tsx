export default function NavbarItem({ children }: { children?: React.ReactNode }) {
    return (
        <div className="navbar-item">
            {children}
        </div>
    );
}
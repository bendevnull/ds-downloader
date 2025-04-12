import NavbarItem from "./NavbarItem"
import { useRef } from "react";
import { useStore } from "./StoreProvider";

export default function NavbarSettingsDropdown() {
    const store = useStore();
    const { columns, setColumns, rows, setRows } = store;
    const columnRef = useRef<HTMLInputElement>(null);
    const rowRef = useRef<HTMLInputElement>(null);

    const handleApplySettings = () => {
        const maxColumns = columnRef.current ? parseInt(columnRef.current.value) : 5;
        const maxRows = rowRef.current ? parseInt(rowRef.current.value) : 4;
        // console.log(`Max Columns: ${maxColumns}, Max Rows: ${maxRows}`);
        // Here you can dispatch actions to update the settings in your store if needed
        setColumns(maxColumns);
        setRows(maxRows);
    };

    return (
        <div className="navbar-item has-dropdown is-hoverable">
            <span className="navbar-link">Settings</span>
            <div className="navbar-dropdown is-right">
                <form onSubmit={(e) => { e.preventDefault(); handleApplySettings(); }}>
                    <NavbarItem> <span>Maximum Columns:</span> </NavbarItem>
                    <NavbarItem> <input type="text" className="input" ref={columnRef} defaultValue={columns} /> </NavbarItem>
                    <NavbarItem> <span>Maximum Rows:</span> </NavbarItem>
                    <NavbarItem> <input type="text" className="input" ref={rowRef} defaultValue={rows} /> </NavbarItem>
                    <NavbarItem> <button className="button is-success" onClick={handleApplySettings}>Apply Settings</button> </NavbarItem>
                </form>
            </div>
        </div>
    )
}
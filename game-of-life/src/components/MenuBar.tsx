import { useEffect, useRef, useState } from "react";
import styles from "./MenuBar.module.css";
import { IoMdArrowDropright, IoMdCheckmark } from "react-icons/io";
import type { MenuItem } from "../types";

export default function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [checkedOptions, setCheckedOptions] = useState({
    showHUD: true,
    showNeighborCount: true,
    viewGrid: true,
    viewLargeGrid: true,
    boundaryType: "finite",
  });

  // close menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        e.target instanceof Node &&
        !menuRef.current.contains(e.target)
      ) {
        setActiveMenu(null);
        setHoveredSubmenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const setOption = (key: string, value: string | boolean) => {
    setCheckedOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const menuItems: { [menuName: string]: MenuItem[] } = {
    File: [
      {
        label: "New",
        action: () => {
          console.log("New");
        },
      },
      {
        label: "Open",
        action: () => {
          console.log("Open");
        },
      },
      {
        label: "Import",
        action: () => {
          console.log("Import");
        },
      },
      {
        label: "Save",
        action: () => {
          console.log("Save");
        },
      },
    ],

    View: [
      {
        label: "Display HUD",
        type: "checkbox",
        checked: checkedOptions.showHUD,
        action: () => {
          console.log("Display HUD");
          setOption("showHUD", !checkedOptions.showHUD);
        },
      },
      {
        label: "Boundary Type",
        type: "submenu",
        submenu: [
          {
            label: "Finite",
            type: "radio",
            checked: checkedOptions.boundaryType === "finite",
            action: () => {
              console.log("Finite");
              setOption("boundaryType", "finite");
            },
          },
          {
            label: "Torodial",
            type: "radio",
            checked: checkedOptions.boundaryType === "torodial",
            action: () => {
              console.log("Torodial");
              setOption("boundaryType", "torodial");
            },
          },
        ],
      },
      {
        label: "Display Neighbors",
        type: "checkbox",
        checked: checkedOptions.showNeighborCount,
        action: () => {
          console.log("Display Neighbors");
          setOption("showNeighborCount", !checkedOptions.showNeighborCount);
        },
      },

      {
        label: "View Grid Lines",
        type: "submenu",
        submenu: [
          {
            label: "10x10",
            type: "checkbox",
            checked: checkedOptions.viewLargeGrid,
            action: () => {
              console.log("10x10");
              setOption("viewLargeGrid", !checkedOptions.viewLargeGrid);
            },
          },
          {
            label: "1x1",
            type: "checkbox",
            checked: checkedOptions.viewGrid,
            action: () => {
              console.log("1x1");
              setOption("viewGrid", !checkedOptions.viewGrid);
            },
          },
        ],
      },
    ],

    Options: [
      {
        label: "Settings",
        action: () => {
          console.log("Settings");
        },
      },
      {
        label: "Randomize Board",
        action: () => {
          console.log("Randomize Board");
        },
      },
    ],
  };

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    setHoveredSubmenu(null);
  };

  const handleMenuItemClick = (menuItem: MenuItem) => {
    if (menuItem.type === "submenu") return;
    if (menuItem.action) {
      menuItem.action();
    }
    if (menuItem.type !== "checkbox" && menuItem.type !== "radio") {
      setActiveMenu(null);
      setHoveredSubmenu(null);
    }
  };

  const renderMenuItem = (
    menuItem: MenuItem,
    index: number,
    isSubMenu = false
  ) => {
    const hasSubmenu = menuItem.type === "submenu";
    const isActive = hoveredSubmenu === index;

    // if is submenu render submenu on mouse hover
    return (
      <div
        onMouseEnter={() => hasSubmenu && setHoveredSubmenu(index)}
        onMouseLeave={() => hasSubmenu && !isSubMenu && setHoveredSubmenu(null)}
        className={styles.menuItemWrapper}
      >
        <button
          onClick={() => handleMenuItemClick(menuItem)}
          className={styles.menuItem}
        >
          <span className={styles.menuLabel}>
            <span className={styles.checkmark}>
              {menuItem.checked && <IoMdCheckmark />}
            </span>

            {menuItem.label}
          </span>
          {hasSubmenu && <IoMdArrowDropright />}
        </button>

        {hasSubmenu && isActive && menuItem.submenu && (
          <div className={styles.subMenuItemsWrapper}>
            {menuItem.submenu.map((subItem, subIndex) =>
              renderMenuItem(subItem, subIndex, true)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={menuRef} className={styles.menuBar}>
      <div className={styles.menus}>
        {Object.keys(menuItems).map((menuName) => (
          <div key={menuName} className={styles.menuWrapper}>
            <button
              onClick={() => handleMenuClick(menuName)}
              onMouseEnter={() => activeMenu && setActiveMenu(menuName)}
              className={styles.menu}
            >
              {menuName}
            </button>

            {activeMenu === menuName && (
              <div className={styles.menuItemsWrapper}>
                {menuItems[menuName].map((item, idx) =>
                  renderMenuItem(item, idx)
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import styles from "./MenuBar.module.css";
import { IoMdArrowDropright, IoMdCheckmark } from "react-icons/io";
import type { MenuItem } from "../types";
import type { GameSettings } from "../GameOfLifeModule";
import SettingsModal from "./SettingsModal";
import RandomizeModal from "./RandomizeModal";

type ModalType = "settings" | "randomize" | null;

export default function MenuBar({
  settings,
  onSettingsChange,
  onRandomize,
}: {
  settings: GameSettings;
  onSettingsChange: (newSettings: GameSettings) => void;
  onRandomize: (seed: number) => void;
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [localSettings, setLocalSettings] = useState(settings);
  const [openModal, setOpenModal] = useState<ModalType>(null);

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

  const setOption = (key: string, value: boolean) => {
    const newSettings = {
      ...localSettings,
      [key]: value,
    };
    setLocalSettings(newSettings);
    // update parent settings on any change
    onSettingsChange(newSettings);
  };

  const menuItems: { [menuName: string]: MenuItem[] } = {
    View: [
      {
        label: "Display HUD",
        type: "checkbox",
        checked: localSettings.showHUD,
        action: () => {
          setOption("showHUD", !localSettings.showHUD);
        },
      },
      {
        label: "Display Neighbors",
        type: "checkbox",
        checked: localSettings.showNeighborCount,
        action: () => {
          setOption("showNeighborCount", !localSettings.showNeighborCount);
        },
      },
      {
        label: "View Grid Lines",
        type: "submenu",
        submenu: [
          {
            label: "10x10",
            type: "checkbox",
            checked: localSettings.showThickGrid,
            action: () => {
              setOption("showThickGrid", !localSettings.showThickGrid);
            },
          },
          {
            label: "1x1",
            type: "checkbox",
            checked: localSettings.showGrid,
            action: () => {
              setOption("showGrid", !localSettings.showGrid);
            },
          },
        ],
      },
      {
        label: "Boundary Type",
        type: "submenu",
        submenu: [
          {
            label: "Finite",
            type: "radio",
            checked: !localSettings.isToroidal,
            action: () => {
              setOption("isToroidal", false);
            },
          },
          {
            label: "Torodial",
            type: "radio",
            checked: localSettings.isToroidal,
            action: () => {
              setOption("isToroidal", true);
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
          setOpenModal("settings");
        },
      },
      {
        label: "Randomize Board",
        action: () => {
          console.log("Randomize Board");
          setOpenModal("randomize");
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
        key={menuItem.label}
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
      {openModal === "settings" && (
        <SettingsModal
          settings={localSettings}
          onSave={(newSettings: GameSettings) => {
            setOpenModal(null);
            onSettingsChange(newSettings);
            setLocalSettings(newSettings);
          }}
          onCancel={() => setOpenModal(null)}
        />
      )}
      {openModal === "randomize" && (
        <RandomizeModal
          onRandomize={(seed: number) => {
            setOpenModal(null);
            onRandomize(seed);
          }}
          onCancel={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}

import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link, useLocation, useNavigate, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, ClipboardList, FileText, LogOut, XIcon, PanelLeftIcon, X, Menu, ChevronRight, ChevronsUpDown, Sparkles, BadgeCheck, CreditCard, Bell, ArrowRight, Sun, Moon, Laptop, SearchIcon, Check, Settings, RotateCcw, CircleCheck } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as React from "react";
import React__default, { useState, createContext, useContext, useEffect } from "react";
import { B as Button, b as buttonVariants } from "./button-CmIj-cVl.js";
import { c as cn } from "./supabase-0PR4I26a.js";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { T as TooltipProvider, a as Tooltip, b as TooltipTrigger, c as TooltipContent, S as Separator, C as CommandDialog, d as CommandInput, e as CommandList, f as CommandEmpty, g as CommandGroup, h as CommandItem, i as CommandSeparator } from "./command-p92Os1Jt.js";
import { g as getCookie, a as setCookie$1, u as useTheme, b as useDirection } from "./router-BmiHf_ZJ.js";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { B as Badge } from "./badge-CiJstU-m.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, e as DropdownMenuItem, f as DropdownMenuGroup, g as DropdownMenuShortcut } from "./dropdown-menu-DNyQp_hH.js";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Root, Item } from "@radix-ui/react-radio-group";
import "@supabase/ssr";
import "clsx";
import "tailwind-merge";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@radix-ui/react-separator";
import "@radix-ui/react-tooltip";
import "cmdk";
import "./dialog-a33jwLhQ.js";
import "@tanstack/react-query";
import "@tanstack/react-router-ssr-query";
import "@tanstack/react-router-devtools";
import "./user-B3mpcRFy.js";
import "zod";
import "next-themes";
import "sonner";
import "@radix-ui/react-direction";
import "js-cookie";
import "node:fs";
import "node:path";
import "./questionnaire-DGzIDWUe.js";
import "zustand";
import "@radix-ui/react-dropdown-menu";
const sidebarData = {
  user: {
    name: "Admin",
    email: "admin@quis.com",
    avatar: "/avatars/admin.jpg"
  },
  navGroups: [
    {
      title: "Menu",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard
        },
        {
          title: "Questionnaires",
          url: "/admin/questionnaires",
          icon: ClipboardList
        },
        {
          title: "Responses",
          url: "/admin/responses",
          icon: FileText
        }
      ]
    },
    {
      title: "Account",
      items: [
        {
          title: "Logout",
          url: "/logout",
          icon: LogOut
        }
      ]
    }
  ]
};
function Sheet({ ...props }) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Root, { "data-slot": "sheet", ...props });
}
function SheetTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Trigger, { "data-slot": "sheet-trigger", ...props });
}
function SheetPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(SheetPrimitive.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Overlay,
    {
      "data-slot": "sheet-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  ...props
}) {
  return /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      SheetPrimitive.Content,
      {
        "data-slot": "sheet-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ jsx(XIcon, { className: "size-4" }),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sheet-header",
      className: cn("flex flex-col gap-1.5 p-4", className),
      ...props
    }
  );
}
function SheetFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sheet-footer",
      className: cn("mt-auto flex flex-col gap-2 p-4", className),
      ...props
    }
  );
}
function SheetTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Title,
    {
      "data-slot": "sheet-title",
      className: cn("text-foreground font-semibold", className),
      ...props
    }
  );
}
function SheetDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SheetPrimitive.Description,
    {
      "data-slot": "sheet-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    void 0
  );
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
function setCookie(name, value, maxAge) {
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(String(value));
  const maxAgePart = ` max-age=${maxAge};`;
  const cookie = `${encodedName}=${encodedValue}; path=/;${maxAgePart}`;
  try {
    document.cookie = cookie;
  } catch {
  }
}
const SidebarContext = React.createContext(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      setCookie(SIDEBAR_COOKIE_NAME, openState, SIDEBAR_COOKIE_MAX_AGE);
    },
    [setOpenProp, open]
  );
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
  }, [isMobile, setOpen]);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar]
  );
  return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      },
      className: cn(
        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
        className
      ),
      ...props,
      children
    }
  ) }) });
}
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  if (collapsible === "none") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        "data-slot": "sidebar",
        className: cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        ),
        ...props,
        children
      }
    );
  }
  if (isMobile) {
    return /* @__PURE__ */ jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxs(
      SheetContent,
      {
        "data-sidebar": "sidebar",
        "data-slot": "sidebar",
        "data-mobile": "true",
        className: "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden",
        style: {
          "--sidebar-width": SIDEBAR_WIDTH_MOBILE
        },
        side,
        children: [
          /* @__PURE__ */ jsxs(SheetHeader, { className: "sr-only", children: [
            /* @__PURE__ */ jsx(SheetTitle, { children: "Sidebar" }),
            /* @__PURE__ */ jsx(SheetDescription, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-full w-full flex-col", children })
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "group peer text-sidebar-foreground hidden md:block",
      "data-state": state,
      "data-collapsible": state === "collapsed" ? collapsible : "",
      "data-variant": variant,
      "data-side": side,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: cn(
              "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-container",
            className: cn(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
              side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
              // Adjust the padding for floating and inset variants.
              variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              className
            ),
            ...props,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: "bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm",
                children
              }
            )
          }
        )
      ]
    }
  );
}
function SidebarTrigger({
  className,
  onClick,
  ...props
}) {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      variant: "ghost",
      size: "icon",
      className: cn("size-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx(PanelLeftIcon, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsx(
    "button",
    {
      "data-sidebar": "rail",
      "data-slot": "sidebar-rail",
      "aria-label": "Toggle Sidebar",
      tabIndex: -1,
      onClick: toggleSidebar,
      title: "Toggle Sidebar",
      className: cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      ),
      ...props
    }
  );
}
function SidebarInset({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "main",
    {
      "data-slot": "sidebar-inset",
      className: cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      ),
      ...props
    }
  );
}
function SidebarHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
}
function SidebarFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-footer",
      "data-sidebar": "footer",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
}
function SidebarContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      className: cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-group",
      "data-sidebar": "group",
      className: cn("relative flex w-full min-w-0 flex-col p-2", className),
      ...props
    }
  );
}
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "div";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "sidebar-group-label",
      "data-sidebar": "group-label",
      className: cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      ),
      ...props
    }
  );
}
function SidebarMenu({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      className: cn("flex w-full min-w-0 flex-col gap-1", className),
      ...props
    }
  );
}
function SidebarMenuItem({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "li",
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  );
}
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();
  const button = /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      ...props
    }
  );
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: button }),
    /* @__PURE__ */ jsx(
      TooltipContent,
      {
        side: "right",
        align: "center",
        hidden: state !== "collapsed" || isMobile,
        ...tooltip
      }
    )
  ] });
}
function SidebarMenuSub({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      "data-slot": "sidebar-menu-sub",
      "data-sidebar": "menu-sub",
      className: cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarMenuSubItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "li",
    {
      "data-slot": "sidebar-menu-sub-item",
      "data-sidebar": "menu-sub-item",
      className: cn("group/menu-sub-item relative", className),
      ...props
    }
  );
}
function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "a";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "sidebar-menu-sub-button",
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
}
const LAYOUT_COLLAPSIBLE_COOKIE_NAME = "layout_collapsible";
const LAYOUT_VARIANT_COOKIE_NAME = "layout_variant";
const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const DEFAULT_VARIANT = "inset";
const DEFAULT_COLLAPSIBLE = "icon";
const LayoutContext = createContext(null);
function LayoutProvider({ children }) {
  const [collapsible, _setCollapsible] = useState(() => {
    const saved = getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME);
    return saved || DEFAULT_COLLAPSIBLE;
  });
  const [variant, _setVariant] = useState(() => {
    const saved = getCookie(LAYOUT_VARIANT_COOKIE_NAME);
    return saved || DEFAULT_VARIANT;
  });
  const setCollapsible = (newCollapsible) => {
    _setCollapsible(newCollapsible);
    setCookie$1(
      LAYOUT_COLLAPSIBLE_COOKIE_NAME,
      newCollapsible,
      LAYOUT_COOKIE_MAX_AGE
    );
  };
  const setVariant = (newVariant) => {
    _setVariant(newVariant);
    setCookie$1(LAYOUT_VARIANT_COOKIE_NAME, newVariant, LAYOUT_COOKIE_MAX_AGE);
  };
  const resetLayout = () => {
    setCollapsible(DEFAULT_COLLAPSIBLE);
    setVariant(DEFAULT_VARIANT);
  };
  const contextValue = {
    resetLayout,
    defaultCollapsible: DEFAULT_COLLAPSIBLE,
    collapsible,
    setCollapsible,
    defaultVariant: DEFAULT_VARIANT,
    variant,
    setVariant
  };
  return /* @__PURE__ */ jsx(LayoutContext, { value: contextValue, children });
}
function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
function AppTitle() {
  const { setOpenMobile } = useSidebar();
  return /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
    SidebarMenuButton,
    {
      size: "lg",
      className: "gap-0 py-0 hover:bg-transparent active:bg-transparent",
      asChild: true,
      children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/",
            onClick: () => setOpenMobile(false),
            className: "grid flex-1 text-start text-sm leading-tight",
            children: [
              /* @__PURE__ */ jsx("span", { className: "truncate font-bold", children: "Kuisioner" }),
              /* @__PURE__ */ jsxs("span", { className: "truncate text-xs", children: [
                "Create by ",
                /* @__PURE__ */ jsx("b", { children: "SyahrulBhudiF" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(ToggleSidebar, {})
      ] })
    }
  ) }) });
}
function ToggleSidebar({
  className,
  onClick,
  ...props
}) {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      variant: "ghost",
      size: "icon",
      className: cn("aspect-square size-8 max-md:scale-125", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx(X, { className: "md:hidden" }),
        /* @__PURE__ */ jsx(Menu, { className: "max-md:hidden" }),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
      ]
    }
  );
}
function Collapsible({
  ...props
}) {
  return /* @__PURE__ */ jsx(CollapsiblePrimitive.Root, { "data-slot": "collapsible", ...props });
}
function CollapsibleTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CollapsiblePrimitive.CollapsibleTrigger,
    {
      "data-slot": "collapsible-trigger",
      ...props
    }
  );
}
function CollapsibleContent({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CollapsiblePrimitive.CollapsibleContent,
    {
      "data-slot": "collapsible-content",
      ...props
    }
  );
}
function NavGroup({ title, items }) {
  const { state, isMobile } = useSidebar();
  const href = useLocation({ select: (location) => location.href });
  return /* @__PURE__ */ jsxs(SidebarGroup, { children: [
    /* @__PURE__ */ jsx(SidebarGroupLabel, { children: title }),
    /* @__PURE__ */ jsx(SidebarMenu, { children: items.map((item) => {
      const key = `${item.title}-${item.url}`;
      if (!item.items)
        return /* @__PURE__ */ jsx(SidebarMenuLink, { item, href }, key);
      if (state === "collapsed" && !isMobile)
        return /* @__PURE__ */ jsx(SidebarMenuCollapsedDropdown, { item, href }, key);
      return /* @__PURE__ */ jsx(SidebarMenuCollapsible, { item, href }, key);
    }) })
  ] });
}
function NavBadge({ children }) {
  return /* @__PURE__ */ jsx(Badge, { className: "rounded-full px-1 py-0 text-xs", children });
}
function SidebarMenuLink({ item, href }) {
  const { setOpenMobile } = useSidebar();
  return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
    SidebarMenuButton,
    {
      asChild: true,
      isActive: checkIsActive(href, item),
      tooltip: item.title,
      children: /* @__PURE__ */ jsxs(Link, { to: item.url, onClick: () => setOpenMobile(false), children: [
        item.icon && /* @__PURE__ */ jsx(item.icon, {}),
        /* @__PURE__ */ jsx("span", { children: item.title }),
        item.badge && /* @__PURE__ */ jsx(NavBadge, { children: item.badge })
      ] })
    }
  ) });
}
function SidebarMenuCollapsible({
  item,
  href
}) {
  const { setOpenMobile } = useSidebar();
  return /* @__PURE__ */ jsx(
    Collapsible,
    {
      asChild: true,
      defaultOpen: checkIsActive(href, item, true),
      className: "group/collapsible",
      children: /* @__PURE__ */ jsxs(SidebarMenuItem, { children: [
        /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarMenuButton, { tooltip: item.title, children: [
          item.icon && /* @__PURE__ */ jsx(item.icon, {}),
          /* @__PURE__ */ jsx("span", { children: item.title }),
          item.badge && /* @__PURE__ */ jsx(NavBadge, { children: item.badge }),
          /* @__PURE__ */ jsx(ChevronRight, { className: "ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" })
        ] }) }),
        /* @__PURE__ */ jsx(CollapsibleContent, { className: "CollapsibleContent", children: /* @__PURE__ */ jsx(SidebarMenuSub, { children: item.items.map((subItem) => /* @__PURE__ */ jsx(SidebarMenuSubItem, { children: /* @__PURE__ */ jsx(
          SidebarMenuSubButton,
          {
            asChild: true,
            isActive: checkIsActive(href, subItem),
            children: /* @__PURE__ */ jsxs(Link, { to: subItem.url, onClick: () => setOpenMobile(false), children: [
              subItem.icon && /* @__PURE__ */ jsx(subItem.icon, {}),
              /* @__PURE__ */ jsx("span", { children: subItem.title }),
              subItem.badge && /* @__PURE__ */ jsx(NavBadge, { children: subItem.badge })
            ] })
          }
        ) }, subItem.title)) }) })
      ] })
    }
  );
}
function SidebarMenuCollapsedDropdown({
  item,
  href
}) {
  return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      SidebarMenuButton,
      {
        tooltip: item.title,
        isActive: checkIsActive(href, item),
        children: [
          item.icon && /* @__PURE__ */ jsx(item.icon, {}),
          /* @__PURE__ */ jsx("span", { children: item.title }),
          item.badge && /* @__PURE__ */ jsx(NavBadge, { children: item.badge }),
          /* @__PURE__ */ jsx(ChevronRight, { className: "ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(DropdownMenuContent, { side: "right", align: "start", sideOffset: 4, children: [
      /* @__PURE__ */ jsxs(DropdownMenuLabel, { children: [
        item.title,
        " ",
        item.badge ? `(${item.badge})` : ""
      ] }),
      /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
      item.items.map((sub) => /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(
        Link,
        {
          to: sub.url,
          className: `${checkIsActive(href, sub) ? "bg-secondary" : ""}`,
          children: [
            sub.icon && /* @__PURE__ */ jsx(sub.icon, {}),
            /* @__PURE__ */ jsx("span", { className: "max-w-52 text-wrap", children: sub.title }),
            sub.badge && /* @__PURE__ */ jsx("span", { className: "ms-auto text-xs", children: sub.badge })
          ]
        }
      ) }, `${sub.title}-${sub.url}`))
    ] })
  ] }) });
}
function checkIsActive(href, item, mainNav = false) {
  return href === item.url || // /endpint?search=param
  href.split("?")[0] === item.url || // endpoint
  !!item?.items?.filter((i) => i.url === href).length || // if child nav is active
  mainNav && href.split("/")[1] !== "" && href.split("/")[1] === item?.url?.split("/")[1];
}
function AlertDialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(AlertDialogPrimitive.Root, { "data-slot": "alert-dialog", ...props });
}
function AlertDialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(AlertDialogPrimitive.Portal, { "data-slot": "alert-dialog-portal", ...props });
}
function AlertDialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Overlay,
    {
      "data-slot": "alert-dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function AlertDialogContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
    /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
    /* @__PURE__ */ jsx(
      AlertDialogPrimitive.Content,
      {
        "data-slot": "alert-dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props
      }
    )
  ] });
}
function AlertDialogHeader({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function AlertDialogFooter({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function AlertDialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Title,
    {
      "data-slot": "alert-dialog-title",
      className: cn("text-lg font-semibold", className),
      ...props
    }
  );
}
function AlertDialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Description,
    {
      "data-slot": "alert-dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function AlertDialogCancel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Cancel,
    {
      className: cn(buttonVariants({ variant: "outline" }), className),
      ...props
    }
  );
}
function ConfirmDialog(props) {
  const {
    title,
    desc,
    children,
    className,
    confirmText,
    cancelBtnText,
    destructive,
    isLoading,
    disabled = false,
    handleConfirm,
    ...actions
  } = props;
  return /* @__PURE__ */ jsx(AlertDialog, { ...actions, children: /* @__PURE__ */ jsxs(AlertDialogContent, { className: cn(className && className), children: [
    /* @__PURE__ */ jsxs(AlertDialogHeader, { className: "text-start", children: [
      /* @__PURE__ */ jsx(AlertDialogTitle, { children: title }),
      /* @__PURE__ */ jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsx("div", { children: desc }) })
    ] }),
    children,
    /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
      /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: isLoading, children: cancelBtnText ?? "Cancel" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: destructive ? "destructive" : "default",
          onClick: handleConfirm,
          disabled: disabled || isLoading,
          children: confirmText ?? "Continue"
        }
      )
    ] })
  ] }) });
}
function SignOutDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleSignOut = () => {
    const currentPath = location.href;
    navigate({
      to: "/logout",
      search: { redirect: currentPath },
      replace: true
    });
  };
  return /* @__PURE__ */ jsx(
    ConfirmDialog,
    {
      open,
      onOpenChange,
      title: "Sign out",
      desc: "Are you sure you want to sign out? You will need to sign in again to access your account.",
      confirmText: "Sign out",
      destructive: true,
      handleConfirm: handleSignOut,
      className: "sm:max-w-sm"
    }
  );
}
function useDialogState(initialState = null) {
  const [open, _setOpen] = useState(initialState);
  const setOpen = (str) => _setOpen((prev) => prev === str ? null : str);
  return [open, setOpen];
}
function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useDialogState();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
        SidebarMenuButton,
        {
          size: "lg",
          className: "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "grid flex-1 text-start text-sm leading-tight", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate font-semibold", children: user.name }),
              /* @__PURE__ */ jsx("span", { className: "truncate text-xs", children: user.email })
            ] }),
            /* @__PURE__ */ jsx(ChevronsUpDown, { className: "ms-auto size-4" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs(
        DropdownMenuContent,
        {
          className: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
          side: isMobile ? "bottom" : "right",
          align: "end",
          sideOffset: 4,
          children: [
            /* @__PURE__ */ jsx(DropdownMenuLabel, { className: "p-0 font-normal", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 px-1 py-1.5 text-start text-sm", children: /* @__PURE__ */ jsxs("div", { className: "grid flex-1 text-start text-sm leading-tight", children: [
              /* @__PURE__ */ jsx("span", { className: "truncate font-semibold", children: user.name }),
              /* @__PURE__ */ jsx("span", { className: "truncate text-xs", children: user.email })
            ] }) }) }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsx(DropdownMenuGroup, { children: /* @__PURE__ */ jsxs(DropdownMenuItem, { children: [
              /* @__PURE__ */ jsx(Sparkles, {}),
              "Upgrade to Pro"
            ] }) }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxs(DropdownMenuGroup, { children: [
              /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/settings/account", children: [
                /* @__PURE__ */ jsx(BadgeCheck, {}),
                "Account"
              ] }) }),
              /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/settings", children: [
                /* @__PURE__ */ jsx(CreditCard, {}),
                "Billing"
              ] }) }),
              /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/settings/notifications", children: [
                /* @__PURE__ */ jsx(Bell, {}),
                "Notifications"
              ] }) })
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxs(
              DropdownMenuItem,
              {
                variant: "destructive",
                onClick: () => setOpen(true),
                children: [
                  /* @__PURE__ */ jsx(LogOut, {}),
                  "Sign out"
                ]
              }
            )
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsx(SignOutDialog, { open: !!open, onOpenChange: setOpen })
  ] });
}
function AppSidebar() {
  const { collapsible, variant } = useLayout();
  return /* @__PURE__ */ jsxs(Sidebar, { collapsible, variant, children: [
    /* @__PURE__ */ jsx(SidebarHeader, { children: /* @__PURE__ */ jsx(AppTitle, {}) }),
    /* @__PURE__ */ jsx(SidebarContent, { children: sidebarData.navGroups.map((props) => /* @__PURE__ */ jsx(NavGroup, { ...props }, props.title)) }),
    /* @__PURE__ */ jsx(SidebarFooter, { children: /* @__PURE__ */ jsx(NavUser, { user: sidebarData.user }) }),
    /* @__PURE__ */ jsx(SidebarRail, {})
  ] });
}
function Header({ className, fixed, children, ...props }) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => document.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsx(
    "header",
    {
      className: cn(
        "z-50 h-16",
        fixed && "header-fixed peer/header sticky top-0 w-[inherit]",
        offset > 10 && fixed ? "shadow" : "shadow-none",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "relative flex h-full items-center gap-3 p-4 sm:gap-4",
            offset > 10 && fixed && "after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg"
          ),
          children: [
            /* @__PURE__ */ jsx(SidebarTrigger, { variant: "outline", className: "max-md:scale-125" }),
            /* @__PURE__ */ jsx(Separator, { orientation: "vertical", className: "h-6" }),
            children
          ]
        }
      )
    }
  );
}
function ProfileDropdown() {
  const [open, setOpen] = useDialogState();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(DropdownMenu, { modal: false, children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "relative h-8 w-8 rounded-full", children: "a" }) }),
      /* @__PURE__ */ jsxs(DropdownMenuContent, { className: "w-56", align: "end", forceMount: true, children: [
        /* @__PURE__ */ jsx(DropdownMenuLabel, { className: "font-normal", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm leading-none font-medium", children: "satnaing" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs leading-none", children: "satnaingdev@gmail.com" })
        ] }) }),
        /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxs(DropdownMenuGroup, { children: [
          /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/settings", children: [
            "Profile",
            /* @__PURE__ */ jsx(DropdownMenuShortcut, { children: "⇧⌘P" })
          ] }) }),
          /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/settings", children: [
            "Billing",
            /* @__PURE__ */ jsx(DropdownMenuShortcut, { children: "⌘B" })
          ] }) }),
          /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/settings", children: [
            "Settings",
            /* @__PURE__ */ jsx(DropdownMenuShortcut, { children: "⌘S" })
          ] }) }),
          /* @__PURE__ */ jsx(DropdownMenuItem, { children: "New Team" })
        ] }),
        /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxs(DropdownMenuItem, { variant: "destructive", onClick: () => setOpen(true), children: [
          "Sign out",
          /* @__PURE__ */ jsx(DropdownMenuShortcut, { className: "text-current", children: "⇧⌘Q" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(SignOutDialog, { open: !!open, onOpenChange: setOpen })
  ] });
}
function ScrollArea({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    ScrollAreaPrimitive.Root,
    {
      "data-slot": "scroll-area",
      className: cn("relative", className),
      ...props,
      children: [
        /* @__PURE__ */ jsx(
          ScrollAreaPrimitive.Viewport,
          {
            "data-slot": "scroll-area-viewport",
            className: "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
            children
          }
        ),
        /* @__PURE__ */ jsx(ScrollBar, {}),
        /* @__PURE__ */ jsx(ScrollAreaPrimitive.Corner, {})
      ]
    }
  );
}
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ScrollAreaPrimitive.ScrollAreaScrollbar,
    {
      "data-slot": "scroll-area-scrollbar",
      orientation,
      className: cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        ScrollAreaPrimitive.ScrollAreaThumb,
        {
          "data-slot": "scroll-area-thumb",
          className: "bg-border relative flex-1 rounded-full"
        }
      )
    }
  );
}
function CommandMenu() {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();
  const runCommand = React__default.useCallback(
    (command) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );
  return /* @__PURE__ */ jsxs(CommandDialog, { modal: true, open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(CommandInput, { placeholder: "Type a command or search..." }),
    /* @__PURE__ */ jsx(CommandList, { children: /* @__PURE__ */ jsxs(ScrollArea, { type: "hover", className: "h-72 pe-1", children: [
      /* @__PURE__ */ jsx(CommandEmpty, { children: "No results found." }),
      sidebarData.navGroups.map((group) => /* @__PURE__ */ jsx(CommandGroup, { heading: group.title, children: group.items.map((navItem, i) => {
        if (navItem.url)
          return /* @__PURE__ */ jsxs(
            CommandItem,
            {
              value: navItem.title,
              onSelect: () => {
                runCommand(() => navigate({ to: navItem.url }));
              },
              children: [
                /* @__PURE__ */ jsx("div", { className: "flex size-4 items-center justify-center", children: /* @__PURE__ */ jsx(ArrowRight, { className: "text-muted-foreground/80 size-2" }) }),
                navItem.title
              ]
            },
            `${navItem.url}-${i}`
          );
        return navItem.items?.map((subItem, i2) => /* @__PURE__ */ jsxs(
          CommandItem,
          {
            value: `${navItem.title}-${subItem.url}`,
            onSelect: () => {
              runCommand(() => navigate({ to: subItem.url }));
            },
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex size-4 items-center justify-center", children: /* @__PURE__ */ jsx(ArrowRight, { className: "text-muted-foreground/80 size-2" }) }),
              navItem.title,
              " ",
              /* @__PURE__ */ jsx(ChevronRight, {}),
              " ",
              subItem.title
            ]
          },
          `${navItem.title}-${subItem.url}-${i2}`
        ));
      }) }, group.title)),
      /* @__PURE__ */ jsx(CommandSeparator, {}),
      /* @__PURE__ */ jsxs(CommandGroup, { heading: "Theme", children: [
        /* @__PURE__ */ jsxs(CommandItem, { onSelect: () => runCommand(() => setTheme("light")), children: [
          /* @__PURE__ */ jsx(Sun, {}),
          " ",
          /* @__PURE__ */ jsx("span", { children: "Light" })
        ] }),
        /* @__PURE__ */ jsxs(CommandItem, { onSelect: () => runCommand(() => setTheme("dark")), children: [
          /* @__PURE__ */ jsx(Moon, { className: "scale-90" }),
          /* @__PURE__ */ jsx("span", { children: "Dark" })
        ] }),
        /* @__PURE__ */ jsxs(CommandItem, { onSelect: () => runCommand(() => setTheme("system")), children: [
          /* @__PURE__ */ jsx(Laptop, {}),
          /* @__PURE__ */ jsx("span", { children: "System" })
        ] })
      ] })
    ] }) })
  ] });
}
const SearchContext = createContext(null);
function SearchProvider({ children }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open2) => !open2);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return /* @__PURE__ */ jsxs(SearchContext, { value: { open, setOpen }, children: [
    children,
    /* @__PURE__ */ jsx(CommandMenu, {})
  ] });
}
const useSearch = () => {
  const searchContext = useContext(SearchContext);
  if (!searchContext) {
    throw new Error("useSearch has to be used within SearchProvider");
  }
  return searchContext;
};
function Search({
  className = "",
  placeholder = "Search"
}) {
  const { setOpen } = useSearch();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      variant: "outline",
      className: cn(
        "bg-muted/25 group text-muted-foreground hover:bg-accent relative h-8 w-full flex-1 justify-start rounded-md text-sm font-normal shadow-none sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64",
        className
      ),
      onClick: () => setOpen(true),
      children: [
        /* @__PURE__ */ jsx(
          SearchIcon,
          {
            "aria-hidden": "true",
            className: "absolute start-1.5 top-1/2 -translate-y-1/2",
            size: 16
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "ms-4", children: placeholder }),
        /* @__PURE__ */ jsxs("kbd", { className: "bg-muted group-hover:bg-accent pointer-events-none absolute end-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs", children: "⌘" }),
          "K"
        ] })
      ]
    }
  );
}
function SkipToMain() {
  return /* @__PURE__ */ jsx(
    "a",
    {
      className: `bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring fixed start-44 z-999 -translate-y-52 px-4 py-2 text-sm font-medium whitespace-nowrap opacity-95 shadow-sm transition focus:translate-y-3 focus:transform focus-visible:ring-1`,
      href: "/",
      children: "Skip to Main"
    }
  );
}
function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    const themeColor = theme === "dark" ? "#020817" : "#fff";
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) metaThemeColor.setAttribute("content", themeColor);
  }, [theme]);
  return /* @__PURE__ */ jsxs(DropdownMenu, { modal: false, children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "icon", className: "scale-95 rounded-full", children: [
      /* @__PURE__ */ jsx(Sun, { className: "size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" }),
      /* @__PURE__ */ jsx(Moon, { className: "absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" }),
      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle theme" })
    ] }) }),
    /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
      /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setTheme("light"), children: [
        "Light",
        " ",
        /* @__PURE__ */ jsx(
          Check,
          {
            size: 14,
            className: cn("ms-auto", theme !== "light" && "hidden")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setTheme("dark"), children: [
        "Dark",
        /* @__PURE__ */ jsx(
          Check,
          {
            size: 14,
            className: cn("ms-auto", theme !== "dark" && "hidden")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setTheme("system"), children: [
        "System",
        /* @__PURE__ */ jsx(
          Check,
          {
            size: 14,
            className: cn("ms-auto", theme !== "system" && "hidden")
          }
        )
      ] })
    ] })
  ] });
}
function IconDir({ dir, className, ...props }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": `icon-dir-${dir}`,
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      className: cn(dir === "rtl" && "rotate-y-180", className),
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: `icon-dir-${dir}` }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M23.42.51h51.92c2.21 0 4 1.79 4 4v42.18c0 2.21-1.79 4-4 4H23.42s-.04-.02-.04-.04V.55s.02-.04.04-.04z",
            opacity: 0.15
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.72,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "2px",
            d: "M5.56 14.88L17.78 14.88"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.48,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "2px",
            d: "M5.56 22.09L16.08 22.09"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.55,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "2px",
            d: "M5.56 18.38L14.93 18.38"
          }
        ),
        /* @__PURE__ */ jsxs("g", { strokeLinecap: "round", strokeMiterlimit: 10, children: [
          /* @__PURE__ */ jsx("circle", { cx: 7.51, cy: 7.4, r: 2.54, opacity: 0.8 }),
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.8,
              strokeWidth: "2px",
              d: "M12.06 6.14L17.78 6.14"
            }
          ),
          /* @__PURE__ */ jsx("path", { fill: "none", opacity: 0.6, d: "M11.85 8.79L16.91 8.79" })
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.62,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "3px",
            d: "M29.41 7.4L34.67 7.4"
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 28.76,
            y: 11.21,
            width: 26.03,
            height: 2.73,
            rx: 0.64,
            ry: 0.64,
            opacity: 0.44,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 28.76,
            y: 17.01,
            width: 44.25,
            height: 13.48,
            rx: 0.64,
            ry: 0.64,
            opacity: 0.3,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 28.76,
            y: 33.57,
            width: 44.25,
            height: 4.67,
            rx: 0.64,
            ry: 0.64,
            opacity: 0.21,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 28.76,
            y: 41.32,
            width: 36.21,
            height: 4.67,
            rx: 0.64,
            ry: 0.64,
            opacity: 0.3,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        )
      ]
    }
  );
}
function IconLayoutCompact(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": "icon-layout-compact",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: "Layout Compact" }),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 5.84,
            y: 5.2,
            width: 4,
            height: 40,
            rx: 2,
            ry: 2,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsxs("g", { stroke: "#fff", strokeLinecap: "round", strokeMiterlimit: 10, children: [
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.66,
              strokeWidth: "2px",
              d: "M7.26 11.56L8.37 11.56"
            }
          ),
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.51,
              strokeWidth: "2px",
              d: "M7.26 14.49L8.37 14.49"
            }
          ),
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.52,
              strokeWidth: "2px",
              d: "M7.26 17.39L8.37 17.39"
            }
          ),
          /* @__PURE__ */ jsx("circle", { cx: 7.81, cy: 7.25, r: 1.16, fill: "#fff", opacity: 0.8 })
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.75,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "3px",
            d: "M15.81 14.49L22.89 14.49"
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 14.93,
            y: 18.39,
            width: 22.19,
            height: 2.73,
            rx: 0.64,
            ry: 0.64,
            opacity: 0.5,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 14.93,
            y: 5.89,
            width: 59.16,
            height: 2.73,
            rx: 0.64,
            ry: 0.64,
            opacity: 0.9,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 14.93,
            y: 24.22,
            width: 32.68,
            height: 19.95,
            rx: 2.11,
            ry: 2.11,
            opacity: 0.4,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsxs("g", { strokeLinecap: "round", strokeMiterlimit: 10, children: [
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 59.05,
              y: 38.15,
              width: 2.01,
              height: 3.42,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.32
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 54.78,
              y: 34.99,
              width: 2.01,
              height: 6.58,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.44
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 63.17,
              y: 32.86,
              width: 2.01,
              height: 8.7,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.53
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 67.54,
              y: 29.17,
              width: 2.01,
              height: 12.4,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.66
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("g", { opacity: 0.5, children: [
          /* @__PURE__ */ jsx("circle", { cx: 62.16, cy: 18.63, r: 7.5 }),
          /* @__PURE__ */ jsx("path", { d: "M62.16 11.63c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7m0-1c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" })
        ] }),
        /* @__PURE__ */ jsxs("g", { opacity: 0.74, children: [
          /* @__PURE__ */ jsx("path", { d: "M63.04 18.13l3.38-5.67c.93.64 1.7 1.48 2.26 2.47.56.98.89 2.08.96 3.21h-6.6z" }),
          /* @__PURE__ */ jsx("path", { d: "M66.57 13.19a6.977 6.977 0 012.52 4.44h-5.17l2.65-4.44m-.31-1.43l-4.1 6.87h8c0-1.39-.36-2.75-1.04-3.95a8.007 8.007 0 00-2.86-2.92z" })
        ] })
      ]
    }
  );
}
function IconLayoutDefault(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": "con-layout-default",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: "Layout Default" }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M39.22 15.99h-8.16c-.79 0-1.43-.67-1.43-1.5s.64-1.5 1.43-1.5h8.16c.79 0 1.43.67 1.43 1.5s-.64 1.5-1.43 1.5z",
            opacity: 0.75
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 29.63,
            y: 18.39,
            width: 16.72,
            height: 2.73,
            rx: 1.36,
            ry: 1.36,
            opacity: 0.5
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M75.1 6.68v1.45c0 .63-.49 1.14-1.09 1.14H30.72c-.6 0-1.09-.51-1.09-1.14V6.68c0-.62.49-1.14 1.09-1.14h43.29c.6 0 1.09.52 1.09 1.14z",
            opacity: 0.9
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 29.63,
            y: 24.22,
            width: 21.8,
            height: 19.95,
            rx: 2.11,
            ry: 2.11,
            opacity: 0.4
          }
        ),
        /* @__PURE__ */ jsxs("g", { strokeLinecap: "round", strokeMiterlimit: 10, children: [
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 61.06,
              y: 38.15,
              width: 2.01,
              height: 3.42,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.32
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 56.78,
              y: 34.99,
              width: 2.01,
              height: 6.58,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.44
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 65.17,
              y: 32.86,
              width: 2.01,
              height: 8.7,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.53
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 69.55,
              y: 29.17,
              width: 2.01,
              height: 12.4,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.66
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("g", { opacity: 0.5, children: [
          /* @__PURE__ */ jsx("circle", { cx: 63.17, cy: 18.63, r: 7.5 }),
          /* @__PURE__ */ jsx("path", { d: "M63.17 11.63c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7m0-1c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" })
        ] }),
        /* @__PURE__ */ jsxs("g", { opacity: 0.74, children: [
          /* @__PURE__ */ jsx("path", { d: "M64.05 18.13l3.38-5.67c.93.64 1.7 1.48 2.26 2.47.56.98.89 2.08.96 3.21h-6.6z" }),
          /* @__PURE__ */ jsx("path", { d: "M67.57 13.19a6.977 6.977 0 012.52 4.44h-5.17l2.65-4.44m-.31-1.43l-4.1 6.87h8c0-1.39-.36-2.75-1.04-3.95a8.007 8.007 0 00-2.86-2.92z" })
        ] }),
        /* @__PURE__ */ jsxs("g", { strokeLinecap: "round", strokeMiterlimit: 10, children: [
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 5.84,
              y: 5.02,
              width: 19.14,
              height: 40,
              rx: 2,
              ry: 2,
              opacity: 0.8
            }
          ),
          /* @__PURE__ */ jsxs("g", { stroke: "#fff", children: [
            /* @__PURE__ */ jsx(
              "path",
              {
                fill: "none",
                opacity: 0.72,
                strokeWidth: "2px",
                d: "M9.02 17.39L21.25 17.39"
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                fill: "none",
                opacity: 0.48,
                strokeWidth: "2px",
                d: "M9.02 24.6L19.54 24.6"
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                fill: "none",
                opacity: 0.55,
                strokeWidth: "2px",
                d: "M9.02 20.88L18.4 20.88"
              }
            ),
            /* @__PURE__ */ jsx("circle", { cx: 10.98, cy: 9.91, r: 2.54, fill: "#fff", opacity: 0.8 }),
            /* @__PURE__ */ jsx(
              "path",
              {
                fill: "none",
                opacity: 0.8,
                strokeWidth: "2px",
                d: "M15.53 8.65L21.25 8.65"
              }
            ),
            /* @__PURE__ */ jsx("path", { fill: "none", opacity: 0.6, d: "M15.32 11.3L20.38 11.3" })
          ] })
        ] })
      ]
    }
  );
}
function IconLayoutFull(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": "icon-layout-full",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: "Layout Full" }),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.75,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "3px",
            d: "M6.85 14.49L15.02 14.49"
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 5.84,
            y: 18.39,
            width: 25.6,
            height: 2.73,
            rx: 0.64,
            ry: 0.64,
            opacity: 0.5,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 5.84,
            y: 5.89,
            width: 68.26,
            height: 2.73,
            rx: 0.64,
            ry: 0.64,
            opacity: 0.9,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 5.84,
            y: 24.22,
            width: 37.71,
            height: 19.95,
            rx: 2.11,
            ry: 2.11,
            opacity: 0.4,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsxs("g", { strokeLinecap: "round", strokeMiterlimit: 10, children: [
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 59.05,
              y: 38.15,
              width: 2.01,
              height: 3.42,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.32
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 54.78,
              y: 34.99,
              width: 2.01,
              height: 6.58,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.44
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 63.17,
              y: 32.86,
              width: 2.01,
              height: 8.7,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.53
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 67.54,
              y: 29.17,
              width: 2.01,
              height: 12.4,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.66
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("g", { opacity: 0.5, children: [
          /* @__PURE__ */ jsx("circle", { cx: 62.16, cy: 18.63, r: 7.5 }),
          /* @__PURE__ */ jsx("path", { d: "M62.16 11.63c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7m0-1c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" })
        ] }),
        /* @__PURE__ */ jsxs("g", { opacity: 0.74, children: [
          /* @__PURE__ */ jsx("path", { d: "M63.04 18.13l3.38-5.67c.93.64 1.7 1.48 2.26 2.47.56.98.89 2.08.96 3.21h-6.6z" }),
          /* @__PURE__ */ jsx("path", { d: "M66.57 13.19a6.977 6.977 0 012.52 4.44h-5.17l2.65-4.44m-.31-1.43l-4.1 6.87h8c0-1.39-.36-2.75-1.04-3.95a8.007 8.007 0 00-2.86-2.92z" })
        ] })
      ]
    }
  );
}
function IconSidebarFloating(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": "icon-sidebar-floating",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: "Sidebar Floating" }),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 5.89,
            y: 5.15,
            width: 19.74,
            height: 40,
            rx: 2,
            ry: 2,
            opacity: 0.8,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsxs("g", { stroke: "#fff", strokeLinecap: "round", strokeMiterlimit: 10, children: [
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.72,
              strokeWidth: "2px",
              d: "M9.81 18.36L22.04 18.36"
            }
          ),
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.48,
              strokeWidth: "2px",
              d: "M9.81 25.57L20.33 25.57"
            }
          ),
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.55,
              strokeWidth: "2px",
              d: "M9.81 21.85L19.18 21.85"
            }
          ),
          /* @__PURE__ */ jsx("circle", { cx: 11.76, cy: 10.88, r: 2.54, fill: "#fff", opacity: 0.8 }),
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.8,
              strokeWidth: "2px",
              d: "M16.31 9.62L22.04 9.62"
            }
          ),
          /* @__PURE__ */ jsx("path", { fill: "none", opacity: 0.6, d: "M16.1 12.27L21.16 12.27" })
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.62,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "3px",
            d: "M30.59 9.62L35.85 9.62"
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 29.94,
            y: 13.42,
            width: 26.03,
            height: 2.73,
            rx: 0.64,
            ry: 0.64,
            opacity: 0.44,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 29.94,
            y: 19.28,
            width: 43.11,
            height: 25.87,
            rx: 2,
            ry: 2,
            opacity: 0.3,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        )
      ]
    }
  );
}
function IconSidebarInset(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": "icon-sidebar-inset",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: "Sidebar Inset" }),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 23.39,
            y: 5.57,
            width: 50.22,
            height: 40,
            rx: 2,
            ry: 2,
            opacity: 0.2,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.72,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "2px",
            d: "M5.08 17.05L17.31 17.05"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.48,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "2px",
            d: "M5.08 24.25L15.6 24.25"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.55,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "2px",
            d: "M5.08 20.54L14.46 20.54"
          }
        ),
        /* @__PURE__ */ jsxs("g", { strokeLinecap: "round", strokeMiterlimit: 10, children: [
          /* @__PURE__ */ jsx("circle", { cx: 7.04, cy: 9.57, r: 2.54, opacity: 0.8 }),
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.8,
              strokeWidth: "2px",
              d: "M11.59 8.3L17.31 8.3"
            }
          ),
          /* @__PURE__ */ jsx("path", { fill: "none", opacity: 0.6, d: "M11.38 10.95L16.44 10.95" })
        ] })
      ]
    }
  );
}
function IconSidebarSidebar(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": "icon-sidebar-sidebar",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: "Sidebar Sidebar" }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M23.42.51h51.99c2.21 0 4 1.79 4 4v42.18c0 2.21-1.79 4-4 4H23.42s-.04-.02-.04-.04V.55s.02-.04.04-.04z",
            opacity: 0.2,
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.72,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "2px",
            d: "M5.56 14.88L17.78 14.88"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.48,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "2px",
            d: "M5.56 22.09L16.08 22.09"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: "none",
            opacity: 0.55,
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: "2px",
            d: "M5.56 18.38L14.93 18.38"
          }
        ),
        /* @__PURE__ */ jsxs("g", { strokeLinecap: "round", strokeMiterlimit: 10, children: [
          /* @__PURE__ */ jsx("circle", { cx: 7.51, cy: 7.4, r: 2.54, opacity: 0.8 }),
          /* @__PURE__ */ jsx(
            "path",
            {
              fill: "none",
              opacity: 0.8,
              strokeWidth: "2px",
              d: "M12.06 6.14L17.78 6.14"
            }
          ),
          /* @__PURE__ */ jsx("path", { fill: "none", opacity: 0.6, d: "M11.85 8.79L16.91 8.79" })
        ] })
      ]
    }
  );
}
function IconThemeDark(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": "icon-theme-dark",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: "Theme Dark" }),
        /* @__PURE__ */ jsxs("g", { fill: "#1d2b3f", children: [
          /* @__PURE__ */ jsx("rect", { x: 0.53, y: 0.5, width: 78.83, height: 50.14, rx: 3.5, ry: 3.5 }),
          /* @__PURE__ */ jsx("path", { d: "M75.86 1c1.65 0 3 1.35 3 3v43.14c0 1.65-1.35 3-3 3H4.03c-1.65 0-3-1.35-3-3V4c0-1.65 1.35-3 3-3h71.83m0-1H4.03c-2.21 0-4 1.79-4 4v43.14c0 2.21 1.79 4 4 4h71.83c2.21 0 4-1.79 4-4V4c0-2.21-1.79-4-4-4z" })
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M22.88 0h52.97c2.21 0 4 1.79 4 4v43.14c0 2.21-1.79 4-4 4H22.88V0z",
            fill: "#0d1628"
          }
        ),
        /* @__PURE__ */ jsx("circle", { cx: 6.7, cy: 7.04, r: 3.54, fill: "#426187" }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M18.12 6.39h-5.87c-.6 0-1.09-.45-1.09-1s.49-1 1.09-1h5.87c.6 0 1.09.45 1.09 1s-.49 1-1.09 1zM16.55 9.77h-4.24c-.55 0-1-.45-1-1s.45-1 1-1h4.24c.55 0 1 .45 1 1s-.45 1-1 1zM18.32 17.37H4.59c-.69 0-1.25-.47-1.25-1.05s.56-1.05 1.25-1.05h13.73c.69 0 1.25.47 1.25 1.05s-.56 1.05-1.25 1.05zM15.34 21.26h-11c-.55 0-1-.41-1-.91s.45-.91 1-.91h11c.55 0 1 .41 1 .91s-.45.91-1 .91zM16.46 25.57H4.43c-.6 0-1.09-.44-1.09-.98s.49-.98 1.09-.98h12.03c.6 0 1.09.44 1.09.98s-.49.98-1.09.98z",
            fill: "#426187"
          }
        ),
        /* @__PURE__ */ jsxs("g", { fill: "#2a62bc", children: [
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 33.36,
              y: 19.73,
              width: 2.75,
              height: 3.42,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.32
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 29.64,
              y: 16.57,
              width: 2.75,
              height: 6.58,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.44
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 37.16,
              y: 14.44,
              width: 2.75,
              height: 8.7,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.53
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 41.19,
              y: 10.75,
              width: 2.75,
              height: 12.4,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.53
            }
          )
        ] }),
        /* @__PURE__ */ jsx("circle", { cx: 62.74, cy: 16.32, r: 8, fill: "#2f5491", opacity: 0.5 }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M62.74 16.32l4.1-6.87c1.19.71 2.18 1.72 2.86 2.92s1.04 2.57 1.04 3.95h-8z",
            fill: "#2f5491",
            opacity: 0.74
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 29.64,
            y: 27.75,
            width: 41.62,
            height: 18.62,
            rx: 1.69,
            ry: 1.69,
            fill: "#17273f"
          }
        )
      ]
    }
  );
}
function IconThemeLight(props) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": "icon-theme-light",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: "Theme Light" }),
        /* @__PURE__ */ jsxs("g", { fill: "#d9d9d9", children: [
          /* @__PURE__ */ jsx("rect", { x: 0.53, y: 0.5, width: 78.83, height: 50.14, rx: 3.5, ry: 3.5 }),
          /* @__PURE__ */ jsx("path", { d: "M75.86 1c1.65 0 3 1.35 3 3v43.14c0 1.65-1.35 3-3 3H4.03c-1.65 0-3-1.35-3-3V4c0-1.65 1.35-3 3-3h71.83m0-1H4.03c-2.21 0-4 1.79-4 4v43.14c0 2.21 1.79 4 4 4h71.83c2.21 0 4-1.79 4-4V4c0-2.21-1.79-4-4-4z" })
        ] }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M22.88 0h52.97c2.21 0 4 1.79 4 4v43.14c0 2.21-1.79 4-4 4H22.88V0z",
            fill: "#ecedef"
          }
        ),
        /* @__PURE__ */ jsx("circle", { cx: 6.7, cy: 7.04, r: 3.54, fill: "#fff" }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M18.12 6.39h-5.87c-.6 0-1.09-.45-1.09-1s.49-1 1.09-1h5.87c.6 0 1.09.45 1.09 1s-.49 1-1.09 1zM16.55 9.77h-4.24c-.55 0-1-.45-1-1s.45-1 1-1h4.24c.55 0 1 .45 1 1s-.45 1-1 1zM18.32 17.37H4.59c-.69 0-1.25-.47-1.25-1.05s.56-1.05 1.25-1.05h13.73c.69 0 1.25.47 1.25 1.05s-.56 1.05-1.25 1.05zM15.34 21.26h-11c-.55 0-1-.41-1-.91s.45-.91 1-.91h11c.55 0 1 .41 1 .91s-.45.91-1 .91zM16.46 25.57H4.43c-.6 0-1.09-.44-1.09-.98s.49-.98 1.09-.98h12.03c.6 0 1.09.44 1.09.98s-.49.98-1.09.98z",
            fill: "#fff"
          }
        ),
        /* @__PURE__ */ jsxs("g", { fill: "#c0c4c4", children: [
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 33.36,
              y: 19.73,
              width: 2.75,
              height: 3.42,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.32
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 29.64,
              y: 16.57,
              width: 2.75,
              height: 6.58,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.44
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 37.16,
              y: 14.44,
              width: 2.75,
              height: 8.7,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.53
            }
          ),
          /* @__PURE__ */ jsx(
            "rect",
            {
              x: 41.19,
              y: 10.75,
              width: 2.75,
              height: 12.4,
              rx: 0.33,
              ry: 0.33,
              opacity: 0.53
            }
          )
        ] }),
        /* @__PURE__ */ jsx("circle", { cx: 62.74, cy: 16.32, r: 8, fill: "#fff" }),
        /* @__PURE__ */ jsxs("g", { fill: "#d9d9d9", children: [
          /* @__PURE__ */ jsx("path", { d: "M63.62 15.82L67 10.15c.93.64 1.7 1.48 2.26 2.47.56.98.89 2.08.96 3.21h-6.6z" }),
          /* @__PURE__ */ jsx("path", { d: "M67.14 10.88a6.977 6.977 0 012.52 4.44h-5.17l2.65-4.44m-.31-1.43l-4.1 6.87h8c0-1.39-.36-2.75-1.04-3.95s-1.67-2.21-2.86-2.92z" })
        ] }),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 29.64,
            y: 27.75,
            width: 41.62,
            height: 18.62,
            rx: 1.69,
            ry: 1.69,
            fill: "#fff"
          }
        )
      ]
    }
  );
}
function IconThemeSystem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      "data-name": "icon-theme-system",
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 79.86 51.14",
      className: cn(
        "overflow-hidden rounded-[6px]",
        "stroke-primary fill-primary group-data-[state=unchecked]:stroke-muted-foreground group-data-[state=unchecked]:fill-muted-foreground",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("title", { children: "Theme System" }),
        /* @__PURE__ */ jsx("path", { opacity: 0.2, d: "M0 0.03H22.88V51.17H0z" }),
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: 6.7,
            cy: 7.04,
            r: 3.54,
            fill: "#fff",
            opacity: 0.8,
            stroke: "#fff",
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M18.12 6.39h-5.87c-.6 0-1.09-.45-1.09-1s.49-1 1.09-1h5.87c.6 0 1.09.45 1.09 1s-.49 1-1.09 1zM16.55 9.77h-4.24c-.55 0-1-.45-1-1s.45-1 1-1h4.24c.55 0 1 .45 1 1s-.45 1-1 1z",
            fill: "#fff",
            stroke: "none",
            opacity: 0.75
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M18.32 17.37H4.59c-.69 0-1.25-.47-1.25-1.05s.56-1.05 1.25-1.05h13.73c.69 0 1.25.47 1.25 1.05s-.56 1.05-1.25 1.05z",
            fill: "#fff",
            stroke: "none",
            opacity: 0.72
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M15.34 21.26h-11c-.55 0-1-.41-1-.91s.45-.91 1-.91h11c.55 0 1 .41 1 .91s-.45.91-1 .91z",
            fill: "#fff",
            stroke: "none",
            opacity: 0.55
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M16.46 25.57H4.43c-.6 0-1.09-.44-1.09-.98s.49-.98 1.09-.98h12.03c.6 0 1.09.44 1.09.98s-.49.98-1.09.98z",
            fill: "#fff",
            stroke: "none",
            opacity: 0.67
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 33.36,
            y: 19.73,
            width: 2.75,
            height: 3.42,
            rx: 0.33,
            ry: 0.33,
            opacity: 0.31,
            stroke: "none"
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 29.64,
            y: 16.57,
            width: 2.75,
            height: 6.58,
            rx: 0.33,
            ry: 0.33,
            opacity: 0.4,
            stroke: "none"
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 37.16,
            y: 14.44,
            width: 2.75,
            height: 8.7,
            rx: 0.33,
            ry: 0.33,
            opacity: 0.26,
            stroke: "none"
          }
        ),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 41.19,
            y: 10.75,
            width: 2.75,
            height: 12.4,
            rx: 0.33,
            ry: 0.33,
            opacity: 0.37,
            stroke: "none"
          }
        ),
        /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx("circle", { cx: 62.74, cy: 16.32, r: 8, opacity: 0.25 }),
          /* @__PURE__ */ jsx(
            "path",
            {
              d: "M62.74 16.32l4.1-6.87c1.19.71 2.18 1.72 2.86 2.92s1.04 2.57 1.04 3.95h-8z",
              opacity: 0.45
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "rect",
          {
            x: 29.64,
            y: 27.75,
            width: 41.62,
            height: 18.62,
            rx: 1.69,
            ry: 1.69,
            opacity: 0.3,
            stroke: "none",
            strokeLinecap: "round",
            strokeMiterlimit: 10
          }
        )
      ]
    }
  );
}
function ConfigDrawer() {
  const { setOpen } = useSidebar();
  const { resetDir } = useDirection();
  const { resetTheme } = useTheme();
  const { resetLayout } = useLayout();
  const handleReset = () => {
    setOpen(true);
    resetDir();
    resetTheme();
    resetLayout();
  };
  return /* @__PURE__ */ jsxs(Sheet, { children: [
    /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      Button,
      {
        size: "icon",
        variant: "ghost",
        "aria-label": "Open theme settings",
        "aria-describedby": "config-drawer-description",
        className: "rounded-full",
        children: /* @__PURE__ */ jsx(Settings, { "aria-hidden": "true" })
      }
    ) }),
    /* @__PURE__ */ jsxs(SheetContent, { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { className: "pb-0 text-start", children: [
        /* @__PURE__ */ jsx(SheetTitle, { children: "Theme Settings" }),
        /* @__PURE__ */ jsx(SheetDescription, { id: "config-drawer-description", children: "Adjust the appearance and layout to suit your preferences." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 overflow-y-auto px-4", children: [
        /* @__PURE__ */ jsx(ThemeConfig, {}),
        /* @__PURE__ */ jsx(SidebarConfig, {}),
        /* @__PURE__ */ jsx(LayoutConfig, {}),
        /* @__PURE__ */ jsx(DirConfig, {})
      ] }),
      /* @__PURE__ */ jsx(SheetFooter, { className: "gap-2", children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: "destructive",
          onClick: handleReset,
          "aria-label": "Reset all settings to default values",
          children: "Reset"
        }
      ) })
    ] })
  ] });
}
function SectionTitle({
  title,
  showReset = false,
  onReset,
  className
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "text-muted-foreground mb-2 flex items-center gap-2 text-sm font-semibold",
        className
      ),
      children: [
        title,
        showReset && onReset && /* @__PURE__ */ jsx(
          Button,
          {
            size: "icon",
            variant: "secondary",
            className: "size-4 rounded-full",
            onClick: onReset,
            children: /* @__PURE__ */ jsx(RotateCcw, { className: "size-3" })
          }
        )
      ]
    }
  );
}
function RadioGroupItem({
  item,
  isTheme = false
}) {
  return /* @__PURE__ */ jsxs(
    Item,
    {
      value: item.value,
      className: cn("group outline-none", "transition duration-200 ease-in"),
      "aria-label": `Select ${item.label.toLowerCase()}`,
      "aria-describedby": `${item.value}-description`,
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "ring-border relative rounded-[6px] ring-[1px]",
              "group-data-[state=checked]:ring-primary group-data-[state=checked]:shadow-2xl",
              "group-focus-visible:ring-2"
            ),
            role: "img",
            "aria-hidden": "false",
            "aria-label": `${item.label} option preview`,
            children: [
              /* @__PURE__ */ jsx(
                CircleCheck,
                {
                  className: cn(
                    "fill-primary size-6 stroke-white",
                    "group-data-[state=unchecked]:hidden",
                    "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
                  ),
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ jsx(
                item.icon,
                {
                  className: cn(
                    !isTheme && "stroke-primary fill-primary group-data-[state=unchecked]:stroke-muted-foreground group-data-[state=unchecked]:fill-muted-foreground"
                  ),
                  "aria-hidden": "true"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "mt-1 text-xs",
            id: `${item.value}-description`,
            "aria-live": "polite",
            children: item.label
          }
        )
      ]
    }
  );
}
function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme();
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      SectionTitle,
      {
        title: "Theme",
        showReset: theme !== defaultTheme,
        onReset: () => setTheme(defaultTheme)
      }
    ),
    /* @__PURE__ */ jsx(
      Root,
      {
        value: theme,
        onValueChange: setTheme,
        className: "grid w-full max-w-md grid-cols-3 gap-4",
        "aria-label": "Select theme preference",
        "aria-describedby": "theme-description",
        children: [
          {
            value: "system",
            label: "System",
            icon: IconThemeSystem
          },
          {
            value: "light",
            label: "Light",
            icon: IconThemeLight
          },
          {
            value: "dark",
            label: "Dark",
            icon: IconThemeDark
          }
        ].map((item) => /* @__PURE__ */ jsx(RadioGroupItem, { item, isTheme: true }, item.value))
      }
    ),
    /* @__PURE__ */ jsx("div", { id: "theme-description", className: "sr-only", children: "Choose between system preference, light mode, or dark mode" })
  ] });
}
function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout();
  return /* @__PURE__ */ jsxs("div", { className: "max-md:hidden", children: [
    /* @__PURE__ */ jsx(
      SectionTitle,
      {
        title: "Sidebar",
        showReset: defaultVariant !== variant,
        onReset: () => setVariant(defaultVariant)
      }
    ),
    /* @__PURE__ */ jsx(
      Root,
      {
        value: variant,
        onValueChange: setVariant,
        className: "grid w-full max-w-md grid-cols-3 gap-4",
        "aria-label": "Select sidebar style",
        "aria-describedby": "sidebar-description",
        children: [
          {
            value: "inset",
            label: "Inset",
            icon: IconSidebarInset
          },
          {
            value: "floating",
            label: "Floating",
            icon: IconSidebarFloating
          },
          {
            value: "sidebar",
            label: "Sidebar",
            icon: IconSidebarSidebar
          }
        ].map((item) => /* @__PURE__ */ jsx(RadioGroupItem, { item }, item.value))
      }
    ),
    /* @__PURE__ */ jsx("div", { id: "sidebar-description", className: "sr-only", children: "Choose between inset, floating, or standard sidebar layout" })
  ] });
}
function LayoutConfig() {
  const { open, setOpen } = useSidebar();
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout();
  const radioState = open ? "default" : collapsible;
  return /* @__PURE__ */ jsxs("div", { className: "max-md:hidden", children: [
    /* @__PURE__ */ jsx(
      SectionTitle,
      {
        title: "Layout",
        showReset: radioState !== "default",
        onReset: () => {
          setOpen(true);
          setCollapsible(defaultCollapsible);
        }
      }
    ),
    /* @__PURE__ */ jsx(
      Root,
      {
        value: radioState,
        onValueChange: (v) => {
          if (v === "default") {
            setOpen(true);
            return;
          }
          setOpen(false);
          setCollapsible(v);
        },
        className: "grid w-full max-w-md grid-cols-3 gap-4",
        "aria-label": "Select layout style",
        "aria-describedby": "layout-description",
        children: [
          {
            value: "default",
            label: "Default",
            icon: IconLayoutDefault
          },
          {
            value: "icon",
            label: "Compact",
            icon: IconLayoutCompact
          },
          {
            value: "offcanvas",
            label: "Full layout",
            icon: IconLayoutFull
          }
        ].map((item) => /* @__PURE__ */ jsx(RadioGroupItem, { item }, item.value))
      }
    ),
    /* @__PURE__ */ jsx("div", { id: "layout-description", className: "sr-only", children: "Choose between default expanded, compact icon-only, or full layout mode" })
  ] });
}
function DirConfig() {
  const { defaultDir, dir, setDir } = useDirection();
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      SectionTitle,
      {
        title: "Direction",
        showReset: defaultDir !== dir,
        onReset: () => setDir(defaultDir)
      }
    ),
    /* @__PURE__ */ jsx(
      Root,
      {
        value: dir,
        onValueChange: setDir,
        className: "grid w-full max-w-md grid-cols-3 gap-4",
        "aria-label": "Select site direction",
        "aria-describedby": "direction-description",
        children: [
          {
            value: "ltr",
            label: "Left to Right",
            icon: (props) => /* @__PURE__ */ jsx(IconDir, { dir: "ltr", ...props })
          },
          {
            value: "rtl",
            label: "Right to Left",
            icon: (props) => /* @__PURE__ */ jsx(IconDir, { dir: "rtl", ...props })
          }
        ].map((item) => /* @__PURE__ */ jsx(RadioGroupItem, { item }, item.value))
      }
    ),
    /* @__PURE__ */ jsx("div", { id: "direction-description", className: "sr-only", children: "Choose between left-to-right or right-to-left site direction" })
  ] });
}
function AuthenticatedLayout({ children }) {
  const defaultOpen = getCookie("sidebar_state") !== "false";
  return /* @__PURE__ */ jsx(SearchProvider, { children: /* @__PURE__ */ jsx(LayoutProvider, { children: /* @__PURE__ */ jsxs(SidebarProvider, { defaultOpen, children: [
    /* @__PURE__ */ jsx(SkipToMain, {}),
    /* @__PURE__ */ jsx(AppSidebar, {}),
    /* @__PURE__ */ jsx(
      SidebarInset,
      {
        className: cn(
          // Set content container, so we can use container queries
          "@container/content",
          // If layout is fixed, set the height
          // to 100svh to prevent overflow
          "has-data-[layout=fixed]:h-svh",
          // If layout is fixed and sidebar is inset,
          // set the height to 100svh - spacing (total margins) to prevent overflow
          "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]"
        ),
        children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Header, { children: /* @__PURE__ */ jsxs("div", { className: "ms-auto flex items-center space-x-4", children: [
            /* @__PURE__ */ jsx(Search, {}),
            /* @__PURE__ */ jsx(ThemeSwitch, {}),
            /* @__PURE__ */ jsx(ConfigDrawer, {}),
            /* @__PURE__ */ jsx(ProfileDropdown, {})
          ] }) }),
          children ?? /* @__PURE__ */ jsx(Outlet, {})
        ] })
      }
    )
  ] }) }) });
}
const SplitComponent = AuthenticatedLayout;
export {
  SplitComponent as component
};

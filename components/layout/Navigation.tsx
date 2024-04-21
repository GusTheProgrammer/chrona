"use client";
import useUserInfoStore from "@/zustand/userStore";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Key,
  JSXElementConstructor,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import { FaBars, FaPowerOff } from "react-icons/fa6";
import { ModeToggle } from "@/components/ModeToggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import chronaLogo from "@/public/img/chrona-logo.png";

import { buttonVariants } from "@/components/ui/button";
import { LogIn, Menu } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UrlObject } from "url";

interface RouteProps {
  href: string;
  label: string;
}

const homePageRouteList: RouteProps[] = [
  {
    href: "#about",
    label: "About",
  },
  {
    href: "#services",
    label: "Services",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { userInfo } = useUserInfoStore((state) => state);
  const [menu, setMenu] = useState<any>(userInfo.menu);

  const handleLogout = () => {
    useUserInfoStore.getState().logout();
  };

  useEffect(() => {
    const label = document.querySelector(`[data-drawer-target="bars"]`);
    if (userInfo.id) {
      setMenu(userInfo.menu);
      label?.classList.remove("hidden");
    } else {
      label?.classList.add("hidden");
    }
  }, [userInfo]);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const profileDropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar>
          <AvatarImage
            src={
              userInfo.image ||
              `https://ui-avatars.com/api/?uppercase=true&name=${userInfo?.name}`
            }
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="hidden lg:block">
        <DropdownMenuItem>
          <Link href="/account/profile" className="justify-between">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button onClick={() => handleLogout()}>
            <Link
              href="/auth/login"
              className="flex justify-start items-center flex-row gap-x-1 text-red-500"
            >
              <FaPowerOff /> <span>Logout</span>
            </Link>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderMenu = (menu: any[]) => {
    return menu.map(
      (
        item: { children: any[]; name: string; path: any },
        index: Key | null | undefined
      ) => {
        if (item.children && item.children.length > 1) {
          return (
            <DropdownMenu key={index}>
              <DropdownMenuTrigger
                className={`text-[17px] ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {capitalizeFirstLetter(item.name)}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="hidden lg:block">
                {item.children.map(
                  (
                    child: {
                      path: string | UrlObject;
                      name:
                        | string
                        | number
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | ReactPortal
                        | PromiseLikeOfReactNode
                        | null
                        | undefined;
                    },
                    i: Key | null | undefined
                  ) => (
                    <DropdownMenuItem key={i}>
                      <Link href={child.path} className="justify-between">
                        {child.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        } else {
          // Direct link if no children or one child
          const singlePath = item.children ? item.children[0].path : item.path;
          return (
            <Link
              key={index}
              href={singlePath}
              className={`text-[17px] ${buttonVariants({ variant: "ghost" })}`}
            >
              {capitalizeFirstLetter(item.name)}
            </Link>
          );
        }
      }
    );
  };

  const isHomePage = usePathname() === "/";

  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <Link href="/" className="ml-2 font-bold text-xl flex">
              chrona.
            </Link>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden">
            <ModeToggle />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>

              <SheetContent side={"left"}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">chrona.</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {isHomePage &&
                    homePageRouteList.map((route: RouteProps, i) => (
                      <Link
                        href={route.href}
                        key={i}
                        className={`text-[17px] ${buttonVariants({
                          variant: "ghost",
                        })}`}
                      >
                        {route.label}
                      </Link>
                    ))}

                  {userInfo.id && renderMenu(menu)}
                  <ModeToggle />
                  {!userInfo.id && (
                    <Link
                      href="/auth/login"
                      className={`border ${buttonVariants({
                        variant: "secondary",
                      })}`}
                    >
                      <LogIn className="mr-2 w-5 h-5" />
                      Login
                    </Link>
                  )}
                  {userInfo.name && profileDropdown}
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* desktop */}
          <nav className="hidden md:flex gap-2">
            {isHomePage &&
              homePageRouteList.map((route: RouteProps, i) => (
                <Link
                  href={route.href}
                  key={i}
                  className={`text-[17px] ${buttonVariants({
                    variant: "ghost",
                  })}`}
                >
                  {route.label}
                </Link>
              ))}

            {userInfo.id && renderMenu(menu)}
          </nav>

          <div className="hidden md:flex gap-2">
            <ModeToggle />
            {!userInfo.id && (
              <Link
                href="/auth/login"
                className={`border ${buttonVariants({ variant: "secondary" })}`}
              >
                <LogIn className="mr-2 w-5 h-5" />
                Login
              </Link>
            )}
            {userInfo.name && profileDropdown}
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};

export default dynamic(() => Promise.resolve(Navigation), { ssr: false });

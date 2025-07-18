// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Truck, ShoppingCart, Menu, X } from "lucide-react";
export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "หน้าแรก", href: "/" },
    { label: "สินค้า", href: "/all-products" },
    { label: "เกี่ยวกับเรา", href: "/contact" },
    { label: "Q/A", href: "/qa" },
  ];

  return (
    <nav className="bg-white shadow relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-24">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="flex-shrink-0 ml-2 md:ml-0">
              <div className="relative w-24 sm:w-32 md:w-40 h-10 sm:h-12 md:h-14">
                <Image
                  src="/images/logo.png"
                  alt="ICN_FREEZE Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Mobile: Orders & Cart Icons directly on bar */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link href="/orders" aria-label="Orders">
              <Truck
                size={24}
                className="text-gray-600 hover:text-green-600 transition"
              />
            </Link>
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart
                size={24}
                className="text-gray-600 hover:text-green-600 transition"
              />
            </Link>
          </div>

          {/* Center (desktop): Nav Links + Language */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex items-center space-x-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`px-3 py-1 text-base font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-green-600 text-white"
                          : "text-gray-700 hover:text-green-600"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center space-x-2 text-sm font-medium">
              <Link
                href="/?lang=th"
                className={`px-2 py-1 rounded transition-colors ${
                  pathname.includes("lang=th")
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                TH
              </Link>
              <Link
                href="/?lang=en"
                className={`px-2 py-1 rounded transition-colors ${
                  pathname.includes("lang=en")
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                EN
              </Link>
            </div>
          </div>

          {/* Right (desktop): Icons & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/orders"
              className="text-gray-600 hover:text-green-600 transition"
            >
              <Truck size={24} />
            </Link>
            <Link
              href="/cart"
              className="text-gray-600 hover:text-green-600 transition"
            >
              <ShoppingCart size={24} />
            </Link>
            {user ? (
              <>
                <span className="text-gray-700">สวัสดี, {user.name}</span>
                <button
                  onClick={logout}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1 text-sm text-gray-700 rounded-md hover:text-green-600 transition"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t shadow-sm">
            <ul className="flex flex-col divide-y">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors ${
                        isActive ? "bg-green-600 text-white" : ""
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col space-y-2 p-4 border-t">
              <div className="flex items-center space-x-2">
                <Link
                  href="/?lang=th"
                  className={`px-2 py-1 rounded transition-colors ${
                    pathname.includes("lang=th")
                      ? "bg-green-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  TH
                </Link>
                <Link
                  href="/?lang=en"
                  className={`px-2 py-1 rounded transition-colors ${
                    pathname.includes("lang=en")
                      ? "bg-green-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  EN
                </Link>
              </div>
              {user ? (
                <>
                  <span className="text-gray-700">สวัสดี, {user.name}</span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="text-red-500 hover:underline text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-gray-700 hover:bg-green-50 px-4 py-2 rounded transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/register"
                    className="block text-green-600 hover:bg-green-50 px-4 py-2 rounded transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    สมัครสมาชิก
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

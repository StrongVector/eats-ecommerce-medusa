"use client";

import { DriverDTO } from "@backend/src/types/delivery/common";
import { RestaurantAdminDTO } from "@backend/src/types/restaurant/common";
import { logout } from "@frontend/lib/actions";
import { Avatar, Button, Text, clx } from "@medusajs/ui";
import { Link } from "next-view-transitions";
import { useEffect, useRef, useState } from "react";

type ProfileBadgeProps = {
  user?: RestaurantAdminDTO | DriverDTO;
};

export function ProfileBadge({ user }: ProfileBadgeProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const hoverRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (hoverRef.current) {
      hoverRef.current.addEventListener("mouseenter", () =>
        setIsDropdownOpen(true)
      );
      hoverRef.current.addEventListener("mouseleave", () =>
        setIsDropdownOpen(false)
      );
    }

    return () => {
      if (hoverRef.current) {
        hoverRef.current.removeEventListener("mouseenter", () =>
          setIsDropdownOpen(true)
        );
        hoverRef.current.removeEventListener("mouseleave", () =>
          setIsDropdownOpen(false)
        );
      }
    };
  }, [hoverRef.current]);

  const dashboardPath = user
    ? user.hasOwnProperty("restaurant")
      ? "/dashboard/restaurant"
      : "/dashboard/driver"
    : "/dashboard/login";

  return (
    <div className="flex flex-col relative group w-fit">
      <Link href={dashboardPath} className="flex gap-2 items-center">
        <Button
          size="large"
          variant="transparent"
          className="group group-hover:bg-ui-bg-subtle-hover transition-none"
          ref={hoverRef}
        >
          <>
            <Text className="text-sm text-ui-bg-base group-hover:text-ui-fg-base">
              {user ? `${user.first_name} ${user.last_name}` : "Login"}
            </Text>
            {user && (
              <Avatar
                src={`https://robohash.org/${user.email}?size=40x40&set=set1&bgset=bg1`}
                fallback={user.first_name[0] + user.last_name[0]}
                className="bg-ui-bg-base cursor-pointer"
              />
            )}
          </>
        </Button>
      </Link>
      {user && isDropdownOpen && (
        <Button
          className={clx(
            "group absolute top-10 bg-ui-bg-subtle-hover group group-hover:bg-ui-bg-subtle-hover w-full py-4 justify-start"
          )}
          ref={hoverRef}
          size="large"
          variant="transparent"
          onClick={async () => logout()}
        >
          <Text className="text-sm group-hover:hover:text-ui-fg-interactive-hover group-hover:text-ui-fg-base text-left ">
            Logout
          </Text>
        </Button>
      )}
    </div>
  );
}

import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "@/components/ui/navbar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="relative mx-auto max-w-container px-4">
        <NavbarComponent>
          <NavbarLeft>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/rooms-list" className="text-muted-foreground hover:text-foreground">
                Browse Meeting Rooms
              </a>
              <a href="/my-favorites" className="text-muted-foreground hover:text-foreground">
                My Favorites
              </a>
              <a href="/my-bookings" className="text-muted-foreground hover:text-foreground">
                My Bookings
              </a>
            </nav>
          </NavbarLeft>
          <NavbarRight>
            <UserButton />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium">
                  <a
                    href="/rooms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Browse Meeting Rooms
                  </a>
                  <a
                    href="/favorites"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    My Favorites
                  </a>
                  <a
                    href="/bookings"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    My Bookings
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}

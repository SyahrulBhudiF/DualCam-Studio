import * as XLSX from "xlsx";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { exportDashboardToExcel } from "./components/dashboard-export";
import { DashboardTabs } from "./components/dashboard-tabs";
import type { DashboardProps } from "./components/types";

export function Dashboard({ summary, breakdown, analytics }: DashboardProps) {
  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() =>
                exportDashboardToExcel({ summary, breakdown, analytics })
              }
            >
              Export Excel
            </Button>
          </div>
        </div>

        <DashboardTabs
          summary={summary}
          breakdown={breakdown}
          analytics={analytics}
          isLoading={false}
        />
      </Main>
    </>
  );
}

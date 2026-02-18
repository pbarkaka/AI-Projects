import React, { useCallback } from 'react';
import { SideNavigation, MenuSection, NavMenuItem, Icon } from '@momentum-design/components/react';
import './sidenav.css';

interface SideNavProps {
  isSideNavExpanded: boolean;
  setIsSideNavExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideNav: React.FC<SideNavProps> = ({ isSideNavExpanded, setIsSideNavExpanded }: SideNavProps) => {
  const handleSideNavToggle = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      const newToggleState = e.detail.expanded;
      setIsSideNavExpanded(newToggleState);
    },
    [setIsSideNavExpanded]
  );

  return (
    <SideNavigation
      expanded={isSideNavExpanded}
      onToggle={handleSideNavToggle}
      variant="flexible"
      footerText="Customer Name"
      grabberBtnAriaLabel="Toggle Side navigation"
      parentNavTooltipText="Contains active navmenuitem"
      className="sidenav"
    >
      <MenuSection slot="scrollable-menubar" showDivider>
        <NavMenuItem iconName="home-bold" navId="overview" label="Overview" />
        <NavMenuItem iconName="alert-bold" navId="alerts-center" label="Alerts center" />
      </MenuSection>
      <MenuSection slot="scrollable-menubar" showDivider headerText="MONITORING">
        <NavMenuItem iconName="analysis-bold" navId="analytics" label="Analytics" />
        <NavMenuItem iconName="multiline-chart-bold" navId="troubleshooting" label="Troubleshooting" />
        <NavMenuItem iconName="document-bold" navId="reports" label="Reports" />
      </MenuSection>
      <MenuSection slot="scrollable-menubar" showDivider headerText="MANAGEMENT">
        <NavMenuItem iconName="user-bold" navId="users" label="Users" />
        <NavMenuItem iconName="create-a-group-bold" navId="groups" label="Groups" />
        <NavMenuItem iconName="location-bold" navId="locations" label="Locations" />
        <NavMenuItem iconName="meetings-team-bold" navId="workspaces" label="Workspaces" />
        <NavMenuItem iconName="generic-device-video-bold" navId="devices" label="Devices" />
        <NavMenuItem iconName="format-default-app-bold" navId="apps" label="Apps" />
        <NavMenuItem iconName="company-bold" navId="account" label="Account" />
        <NavMenuItem iconName="settings-bold" navId="org-settings" label="Organization settings" />
      </MenuSection>
      <MenuSection slot="scrollable-menubar" headerText="SERVICES">
        <NavMenuItem iconName="chat-bold" navId="messaging" label="Messaging" />
        <NavMenuItem iconName="calendar-month-bold" navId="meetings" label="Meetings" />
        <NavMenuItem iconName="phone-bold" navId="calling" label="Calling" active />
        <NavMenuItem iconName="intelligent-routing-bold" navId="pstn-routing" label="PSTN & Routing" />
        <NavMenuItem iconName="people-bold" navId="customer-experience" label="Customer Experience" />
        <NavMenuItem iconName="headset-bold" navId="contact-center" label="Contact Center" />
        <NavMenuItem iconName="view-stacked-bold" navId="connected-uc" label="Connected UC" />
        <NavMenuItem iconName="cloud-frame-bold" navId="ucm-cloud" label="UCM Cloud" />
        <NavMenuItem iconName="cloud-bold" navId="hybrid" label="Hybrid" />
      </MenuSection>
      <Icon slot="brand-logo" name="company-bold" />
    </SideNavigation>
  );
};

export default SideNav;

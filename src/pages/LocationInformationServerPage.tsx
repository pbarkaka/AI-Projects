import React, { useState } from 'react';
import {
  Button,
  Card,
  Tab,
  TabList,
  Text,
  ToggleTip,
} from '@momentum-design/components/react';
import './location-information-server.css';

const PRIMARY_TABS = [
  'Overview',
  'Numbers',
  'Virtual lines',
  'Call routing',
  'Location information server',
  'Features',
  'PSTN',
  'Service settings',
];

const SECONDARY_TABS = [
  'Summary',
  'HELD requests',
  'Addresses',
  'MAC',
  'Gateway MAC',
  'BSSID',
  'LLDP',
  'Internal IP ranges',
  'External IP ranges',
];

const DATA_CARDS = [
  { title: 'MAC addresses', value: '108' },
  { title: 'Gateway MAC addresses', value: '108' },
  { title: 'BSSIDs', value: '130' },
  { title: 'LLDPs', value: '201' },
  { title: 'Internal IP ranges', value: '26' },
  { title: 'External IP ranges', value: '15' },
];

const LocationInformationServerPage: React.FC = () => {
  const toTabId = (s: string) => s.toLowerCase().replace(/\s+/g, '-');
  const [primaryTabId, setPrimaryTabId] = useState(toTabId('Location information server'));
  const [secondaryTabId, setSecondaryTabId] = useState('summary');

  return (
    <div className="lis-page">
      <div className="lis-page-header">
        <Text type="heading-large-bold" tagname="h1" className="lis-page-title">
          Calling
        </Text>
      </div>

      <div className="lis-primary-tabs-wrapper">
        <TabList
          className="lis-primary-tabs"
          activeTabId={primaryTabId}
          onChange={(e: CustomEvent<{ tabId: string }>) => setPrimaryTabId(e.detail.tabId)}
          data-aria-label="Calling sections"
        >
          {PRIMARY_TABS.map((label) => (
            <Tab
              key={label}
              tabId={toTabId(label)}
              text={label}
              variant="pill"
              active={primaryTabId === toTabId(label)}
            />
          ))}
        </TabList>
        <Button variant="tertiary" size={32} prefixIcon="arrow-right-bold" aria-label="More tabs" className="lis-tab-arrow" />
      </div>

      <TabList
        className="lis-secondary-tabs"
        activeTabId={secondaryTabId}
        onChange={(e: CustomEvent<{ tabId: string }>) => setSecondaryTabId(e.detail.tabId)}
        data-aria-label="Location information server"
      >
        {SECONDARY_TABS.map((label) => (
          <Tab
            key={label}
            tabId={toTabId(label)}
            text={label}
            variant="line"
            active={secondaryTabId === toTabId(label)}
          />
        ))}
      </TabList>

      <div className="lis-description">
        <Text type="body-midsize-regular" tagname="p">
          A Location Information Server (LIS) is a network component that provides location
          information for devices within a specific access network. This is particularly
          important for services like emergency calling (e911), where accurate location data
          is crucial for routing calls to the correct Public Safety Answering Point (PSAP).
        </Text>
      
      </div>

      <div className="lis-cards">
        <div className="lis-card-addresses">
          <Card
            cardTitle="Addresses"
            variant="border"
            className="lis-addresses-card"
          >
            <div slot="icon-button" className="lis-card-info-wrapper">
              <Button id="addresses-info" variant="tertiary" size={20} prefixIcon="info-circle-regular" aria-label="Info" className="lis-addresses-header-info" />
              <ToggleTip triggerID="addresses-info" placement="top">
                Information about Addresses
              </ToggleTip>
            </div>
            <div slot="body" className="lis-addresses-body">
              <Text type="heading-xlarge-medium" tagname="span" className="lis-card-value">150</Text>
              <div className="lis-addresses-rows">
                <div className="lis-addresses-row">
                  <span className="lis-addresses-swatch lis-addresses-swatch-with" aria-hidden />
                  <span className="lis-addresses-label">Addresses with network information: 105</span>
                  <Button variant="tertiary" size={20} prefixIcon="info-circle-regular" aria-label="Info" className="lis-addresses-row-info" />
                  <div className="lis-addresses-bar-track">
                    <div className="lis-addresses-bar-fill lis-addresses-bar-with" style={{ width: '70%' }} />
                  </div>
                </div>
                <div className="lis-addresses-row">
                  <span className="lis-addresses-swatch lis-addresses-swatch-without" aria-hidden />
                  <span className="lis-addresses-label">Addresses without network information: 45</span>
                  <Button variant="tertiary" size={20} prefixIcon="info-circle-regular" aria-label="Info" className="lis-addresses-row-info" />
                  <div className="lis-addresses-bar-track">
                    <div className="lis-addresses-bar-fill lis-addresses-bar-without" style={{ width: '30%' }} />
                  </div>
                </div>
              </div>
              <div className="lis-addresses-separator" aria-hidden />
            </div>
            <Button slot="footer-button-primary" variant="secondary" size={40} className="lis-addresses-manage-btn">
              Manage
            </Button>
          </Card>
        </div>

        <div className="lis-card-grid">
          {DATA_CARDS.map(({ title, value }) => (
            <Card
              key={title}
              cardTitle={title}
              variant="border"
              className="lis-data-card"
            >
              <div slot="icon-button" className="lis-card-info-wrapper">
                <Button id={`info-${title.replace(/\s+/g, '-')}`} variant="tertiary" size={20} prefixIcon="info-circle-regular" aria-label="Info" />
                <ToggleTip triggerID={`info-${title.replace(/\s+/g, '-')}`} placement="top">
                  Information about {title}
                </ToggleTip>
              </div>
              <div slot="body" className="lis-data-card-body">
                <Text type="heading-xlarge-medium" tagname="span" className="lis-card-value">{value}</Text>
              </div>
              <Button slot="footer-button-primary" variant="secondary" size={40}>
                Manage
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationInformationServerPage;

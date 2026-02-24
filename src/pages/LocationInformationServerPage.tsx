import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
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
  'AI Assistance',
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

type ChartDataPoint = { name: string; value: number };

interface ChatMessageChart {
  type: 'bar' | 'line';
  title: string;
  data: ChartDataPoint[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chart?: ChatMessageChart;
}

/** Renders content with \n as line breaks and **text** as bold. */
function renderMessageContent(content: string): React.ReactNode {
  return content.split('\n').map((line, i) => {
    const parts: React.ReactNode[] = [];
    let rest = line;
    let key = 0;
    while (rest.length > 0) {
      const boldStart = rest.indexOf('**');
      if (boldStart === -1) {
        if (rest) parts.push(<React.Fragment key={key++}>{rest}</React.Fragment>);
        break;
      }
      if (boldStart > 0) parts.push(<React.Fragment key={key++}>{rest.slice(0, boldStart)}</React.Fragment>);
      const boldEnd = rest.indexOf('**', boldStart + 2);
      if (boldEnd === -1) {
        parts.push(<React.Fragment key={key++}>{rest.slice(boldStart)}</React.Fragment>);
        break;
      }
      parts.push(<strong key={key++}>{rest.slice(boldStart + 2, boldEnd)}</strong>);
      rest = rest.slice(boldEnd + 2);
    }
    return (
      <p key={i} className="lis-ai-chat-paragraph">
        {parts}
      </p>
    );
  });
}

const DATA_CARDS = [
  { title: 'MAC addresses', value: '108' },
  { title: 'Gateway MAC addresses', value: '108' },
  { title: 'BSSIDs', value: '130' },
  { title: 'LLDPs', value: '201' },
  { title: 'Internal IP ranges', value: '26' },
  { title: 'External IP ranges', value: '15' },
];

/** Dummy responses with chart data (assumes LIS/API data is available). Answers are specific to the query. */
function getDummyResponse(query: string): { content: string; chart?: ChatMessageChart } {
  const q = query.toLowerCase().trim();
  const isBookingRequest =
    q.includes('book') &&
    !q.includes("can't") &&
    !q.includes('cannot') &&
    !q.includes('unable') &&
    !q.includes('not able');

  if (isBookingRequest) {
    return {
      content:
        'The room has been booked for **30 mins**. You can change the duration from your Webex app.\n\n**Here are the details:**\n\n**Room:** Meridian, Building A, 2nd floor, East wing\n\n**Meeting:** "Meridian — 30 min"\nStarts now\nJoin from your calendar or the Webex app.',
    };
  }

  const isConferenceRoomRequest =
    (q.includes('conference room') || q.includes('meeting room')) &&
    (q.includes('nearest') || q.includes('nearby') || q.includes('closest') || q.includes('find') || q.includes('which')) &&
    (q.includes('free') || q.includes('available') || q.includes('vacant') || q.includes('open') || q.includes('seat'));

  if (isConferenceRoomRequest) {
    return {
      content:
        'Based on your location, the nearest available room is **Meridian** (6 seats).\n\nIt is in **Building A**, **2nd floor**, **East wing**.\n\nWould you like me to book it for you?',
    };
  }

  // "How many X?" / LIS stats
  if (/\bhow many\b/.test(q) || /\bcount\b/.test(q) || /\bnumber of\b/.test(q) || /\btotal\b.*\b(mac|bssid|lldp|address|ip range)\b/.test(q)) {
    if (q.includes('mac') && !q.includes('gateway')) {
      return { content: 'The LIS currently has **108** MAC addresses registered.' };
    }
    if (q.includes('gateway mac')) {
      return { content: 'The LIS currently has **108** Gateway MAC addresses registered.' };
    }
    if (q.includes('bssid')) {
      return { content: 'The LIS currently has **130** BSSIDs registered.' };
    }
    if (q.includes('lldp')) {
      return { content: 'The LIS currently has **201** LLDP entries registered.' };
    }
    if (q.includes('internal') && q.includes('ip')) {
      return { content: 'The LIS has **26** internal IP ranges configured.' };
    }
    if (q.includes('external') && q.includes('ip')) {
      return { content: 'The LIS has **15** external IP ranges configured.' };
    }
  }

  // "Where am I?" / current location
  if (/\bwhere am i\b|\bmy location\b|\bcurrent location\b|\bwhat('s| is) my location\b/.test(q)) {
    return {
      content:
        'Based on the LIS, your device is at **Building A**, **1st floor**, **North wing** (IP range 10.0.1.0/24, BSSID last seen: Building-A-North-1).',
    };
  }

  // VPN + location (specific answers per location)
  if (q.includes('vpn')) {
    if (q.includes('cafeteria') || q.includes('canteen')) {
      return {
        content:
          '**VPN from the cafeteria:** Success rate there is **72%** (last 7 days). That segment has higher latency (avg 89 ms vs 22 ms in Building A) and lower throughput to the VPN concentrator, and the cafeteria uses guest Wi‑Fi with more contention.\n\nThe chart shows VPN success rate by location.',
        chart: {
          type: 'bar',
          title: 'VPN connection success rate by location (last 7 days)',
          data: [
            { name: 'Cafeteria', value: 72 },
            { name: 'BGL18', value: 94 },
            { name: 'Building A', value: 98 },
            { name: 'Building B', value: 96 },
            { name: 'Lobby', value: 89 },
          ],
        },
      };
    }
    if (q.includes('bgl18') || q.includes('bgl 18')) {
      return {
        content:
          '**VPN from BGL18:** Success rate there is **94%** (last 7 days). Failures are mostly during peak hours (11:00–14:00) when concurrent sessions are high. The chart shows success rate by location for comparison.',
        chart: {
          type: 'bar',
          title: 'VPN success rate by location (last 7 days)',
          data: [
            { name: 'Cafeteria', value: 72 },
            { name: 'BGL18', value: 94 },
            { name: 'Building A', value: 98 },
            { name: 'Building B', value: 96 },
          ],
        },
      };
    }
    if (q.includes('building a') || q.includes('building b') || q.includes('lobby')) {
      return {
        content:
          'VPN from that location is generally strong. **Building A** 98%, **Building B** 96%, **Lobby** 89% success (last 7 days). The chart below shows all locations.',
        chart: {
          type: 'bar',
          title: 'VPN success rate by location (last 7 days)',
          data: [
            { name: 'Cafeteria', value: 72 },
            { name: 'Lobby', value: 89 },
            { name: 'BGL18', value: 94 },
            { name: 'Building B', value: 96 },
            { name: 'Building A', value: 98 },
          ],
        },
      };
    }
    // Generic VPN question
    return {
      content:
        'VPN performance depends on location. **Best:** Building A (98%), Building B (96%). **Lowest:** Cafeteria (72%) due to guest Wi‑Fi and higher latency. Chart shows success rate by location (last 7 days).',
      chart: {
        type: 'bar',
        title: 'VPN success rate by location (last 7 days)',
        data: [
          { name: 'Cafeteria', value: 72 },
          { name: 'Lobby', value: 89 },
          { name: 'BGL18', value: 94 },
          { name: 'Building B', value: 96 },
          { name: 'Building A', value: 98 },
        ],
      },
    };
  }

  // Network bad/slow at [location] (with time if mentioned)
  const networkBadMatch = q.match(/\b(why was the )?network (bad|slow|down|poor|issues?)\s+(at|in)\s+([^.?!]+)/) ||
    q.match(/\b(bad|slow|poor)\s+network\s+(at|in)\s+([^.?!]+)/) ||
    q.match(/\b(bgl18|bgl 18|building a|building b|cafeteria|lobby)\s+(yesterday|today|last week)?\s*(network|bad|slow)?/);
  const locationMatch = q.match(/\b(bgl18|bgl 18|building a|building b|cafeteria|lobby)\b/);

  if (networkBadMatch || (locationMatch && (q.includes('network') || q.includes('bad') || q.includes('slow') || q.includes('yesterday') || q.includes('today')))) {
    const loc = locationMatch ? locationMatch[1].replace(' ', '') : 'bgl18';
    const isYesterday = q.includes('yesterday');
    const isToday = q.includes('today');
    const timeLabel = isYesterday ? 'yesterday' : isToday ? 'today' : 'recently';

    if (loc === 'bgl18') {
      return {
        content:
          `At **BGL18** ${timeLabel}, traffic was **42% above** the 7-day average. Peak concurrent sessions were highest between **10:00 and 14:00**, which explains the slower network and timeouts.\n\nThe chart shows hourly traffic (that day vs 7-day average).`,
        chart: {
          type: 'line',
          title: 'BGL18 traffic: that day vs 7-day average',
          data: [
            { name: '06:00', value: 28 },
            { name: '08:00', value: 72 },
            { name: '10:00', value: 95 },
            { name: '12:00', value: 142 },
            { name: '14:00', value: 118 },
            { name: '16:00', value: 98 },
            { name: '18:00', value: 65 },
          ],
        },
      };
    }
    if (loc === 'buildinga' || q.includes('building a')) {
      return {
        content:
          `At **Building A** ${timeLabel}, concurrent sessions were **38% above** average. Peak load was **11:00–14:00**. That matches the reported slowness and packet loss.\n\nThe chart shows hourly concurrent sessions (that day vs 7-day average).`,
        chart: {
          type: 'line',
          title: 'Building A: hourly sessions (that day vs 7-day average)',
          data: [
            { name: '08:00', value: 65 },
            { name: '10:00', value: 98 },
            { name: '12:00', value: 138 },
            { name: '14:00', value: 125 },
            { name: '16:00', value: 92 },
            { name: '18:00', value: 55 },
          ],
        },
      };
    }
    if (loc === 'buildingb' || q.includes('building b')) {
      return {
        content:
          `At **Building B** ${timeLabel}, traffic was **29% above** the 7-day average. Peak was around **12:00–13:00**. That can explain the bad network experience.\n\nThe chart shows relative traffic by hour.`,
        chart: {
          type: 'line',
          title: 'Building B: traffic index (that day vs 7-day average)',
          data: [
            { name: '08:00', value: 58 },
            { name: '10:00', value: 88 },
            { name: '12:00', value: 129 },
            { name: '14:00', value: 105 },
            { name: '16:00', value: 78 },
          ],
        },
      };
    }
    if (loc === 'cafeteria') {
      return {
        content:
          `In the **cafeteria** ${timeLabel}, the network was congested because guest Wi‑Fi had **2.1×** the usual number of devices. Throughput dropped between **12:00 and 13:30** (lunch peak).\n\nThe chart shows concurrent devices on cafeteria Wi‑Fi by hour.`,
        chart: {
          type: 'line',
          title: 'Cafeteria Wi‑Fi: concurrent devices by hour',
          data: [
            { name: '11:00', value: 45 },
            { name: '11:30', value: 78 },
            { name: '12:00', value: 142 },
            { name: '12:30', value: 158 },
            { name: '13:00', value: 135 },
            { name: '13:30', value: 82 },
          ],
        },
      };
    }
    if (loc === 'lobby') {
      return {
        content:
          `In the **lobby** ${timeLabel}, the network was slow because of **high guest device count** (3× normal during 09:00–11:00). That segment shares bandwidth with visitor Wi‑Fi.\n\nThe chart shows lobby + guest Wi‑Fi usage by hour.`,
        chart: {
          type: 'line',
          title: 'Lobby + guest Wi‑Fi usage (that day)',
          data: [
            { name: '08:00', value: 35 },
            { name: '09:00', value: 95 },
            { name: '10:00', value: 118 },
            { name: '11:00', value: 102 },
            { name: '12:00', value: 68 },
          ],
        },
      };
    }
  }

  // Unrecognized: direct message, no chart
  return {
    content:
      'I don\'t have a direct answer for that from the location or network data I use. You can ask for:\n\n• **Network or VPN issues** at a specific place (e.g. BGL18, Building A, cafeteria)\n• **How many** MAC addresses, BSSIDs, LLDPs, or IP ranges are in the LIS\n• **Your current location** (where am I?)\n• **Nearest free conference room** (and I can book it)',
  };
}

const LocationInformationServerPage: React.FC = () => {
  const toTabId = (s: string) => s.toLowerCase().replace(/\s+/g, '-');
  const [primaryTabId, setPrimaryTabId] = useState(toTabId('Location information server'));
  const [secondaryTabId, setSecondaryTabId] = useState('summary');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const scrollChatToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollChatToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsAssistantTyping(true);

    // Simulate AI response using dummy data (API integration assumed available)
    setTimeout(() => {
      const { content, chart } = getDummyResponse(trimmed);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content,
        chart,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
      setIsAssistantTyping(false);
    }, 800);
  };

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isAIAssistanceTab = secondaryTabId === toTabId('AI Assistance');

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

      {isAIAssistanceTab ? (
        <div className="lis-ai-chat">
          <div className="lis-ai-chat-panel">
            <div className="lis-ai-chat-messages" role="log" aria-live="polite">
              {chatMessages.length === 0 && (
                <div className="lis-ai-chat-welcome">
                  <Text type="body-midsize-regular" tagname="p">
                    Ask about location-based networking, VPN or conference rooms.
                  </Text>
                </div>
              )}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`lis-ai-chat-bubble lis-ai-chat-bubble--${msg.role}`}
                  data-role={msg.role}
                >
                  <div className="lis-ai-chat-bubble-content">
                    {renderMessageContent(msg.content)}
                  </div>
                  {msg.role === 'assistant' && msg.chart && (
                    <div className="lis-ai-chat-chart" role="img" aria-label={msg.chart.title}>
                      <div className="lis-ai-chat-chart-title">{msg.chart.title}</div>
                      <ResponsiveContainer width="100%" height={200}>
                        {msg.chart.type === 'bar' ? (
                          <BarChart data={msg.chart.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} width={28} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--mds-color-theme-background-solid-secondary, #2d2d2d)',
                                border: '1px solid var(--mds-color-theme-outline-primary-normal)',
                                borderRadius: 8,
                              }}
                              formatter={(value: number | undefined) => [value != null && msg.chart?.type === 'bar' ? `${value}%` : String(value ?? ''), '']}
                            />
                            <Bar dataKey="value" fill="var(--mds-color-theme-outline-input-active, #1170cf)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        ) : (
                          <LineChart data={msg.chart.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--mds-color-theme-outline-primary-normal, rgba(255,255,255,0.2))" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} width={28} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--mds-color-theme-background-solid-secondary, #2d2d2d)',
                                border: '1px solid var(--mds-color-theme-outline-primary-normal)',
                                borderRadius: 8,
                              }}
                            />
                            <Line type="monotone" dataKey="value" stroke="var(--mds-color-theme-outline-input-active, #1170cf)" strokeWidth={2} dot={{ r: 4 }} />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ))}
              {isAssistantTyping && (
                <div className="lis-ai-chat-bubble lis-ai-chat-bubble--assistant lis-ai-chat-typing" data-role="assistant">
                  <span className="lis-ai-chat-typing-dots" aria-hidden>
                    <span /><span /><span />
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="lis-ai-chat-input-row">
              <input
                ref={chatInputRef}
                type="text"
                className="lis-ai-chat-input"
                placeholder="Ask about location or network access..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                disabled={isAssistantTyping}
                aria-label="Ask a question about location or network"
              />
              <Button
                variant="primary"
                size={40}
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isAssistantTyping}
                aria-label="Send message"
              >
                Send
              </Button>
              <Button
                variant="secondary"
                size={40}
                onClick={() => setChatMessages([])}
                aria-label="Clear chat"
              >
                Clear chat
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default LocationInformationServerPage;

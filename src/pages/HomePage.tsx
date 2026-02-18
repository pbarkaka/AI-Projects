import React from 'react';

import { Avatar, Text, Button, Chip, ToggleTip } from '@momentum-design/components/react';
import './homepage.css';

const HomePage: React.FC = () => {
    return (
        <div className="home-page-wrapper">
            <div className="home-page-header">
                <div className="home-page-left-section">
                    <Avatar size={64} iconName='placeholder-regular'></Avatar>
                </div>
                <div className="home-page-middle-section">
                    <div className="home-page-middle-section-first-line">
                        <Text type="heading-midsize-bold" tagname='span'>Page title</Text>
                        <Button id="info-icon-button" variant="tertiary" size={20} prefixIcon="info-circle-regular" aria-label="info icon button"></Button>
                        <ToggleTip triggerID='info-icon-button' placement='bottom'>
                            This is a description about the page title.
                        </ToggleTip>
                        {/* TODO: make this a static chip without interaction */}
                        <Chip label='Label'></Chip>
                    </div>
                    <div className="home-page-middle-section-second-line">
                        <Text type="body-midsize-medium" tagname='span'>Description</Text>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
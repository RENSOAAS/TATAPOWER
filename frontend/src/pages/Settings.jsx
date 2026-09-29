import React, { useState } from 'react';
import Layout from '../layout/Layout';
import TabNavItem from '../components/ui/tabComponents/TabNavItem';
import TabContent from '../components/ui/tabComponents/TabContent';

import UserSettings from '../components/ui/settingsPage/UserSettings'
import UpdateMachine from '../components/ui/settingsPage/UpdateMachine'
import DbSettings from '../components/ui/settingsPage/DbSettings'
import MqttSettings from '../components/ui/settingsPage/MqttSettings'
import EmailSettings from '../components/ui/settingsPage/EmailSettings'
import DeleteOldData from '../components/ui/settingsPage/DeleteOldData';

import "../styles/settings.css";

const Settings = () => {
    const [activeTab, setActiveTab] = useState("tab1");

    const showSettingsPage = () => {
        return (
            <div className='settings-page-wrapper'>
                <div className="settings-page-header">
                    <div className='settings-buttons-container'>
                        <TabNavItem
                            title="Machines"
                            id="tab1"
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                        <TabNavItem
                            title="Users"
                            id="tab2"
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                        <TabNavItem
                            title="Database"
                            id="tab3"
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                        <TabNavItem
                            title="MQTT"
                            id="tab4"
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                        <TabNavItem
                            title="Email"
                            id="tab5"
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                        <TabNavItem
                            title="DeleteOldData"
                            id="tab6"
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>
                </div>
                <div className='settings-page-contents-container'>
                    <TabContent id="tab1" activeTab={activeTab}>
                        <UpdateMachine />
                    </TabContent>
                    <TabContent id="tab2" activeTab={activeTab}>
                        <UserSettings />
                    </TabContent>
                    <TabContent id="tab3" activeTab={activeTab}>
                        <DbSettings />
                    </TabContent>
                    <TabContent id="tab4" activeTab={activeTab}>
                        <MqttSettings />
                    </TabContent>
                    <TabContent id="tab5" activeTab={activeTab}>
                        <EmailSettings />
                    </TabContent>
                    <TabContent id="tab6" activeTab={activeTab}>
                        <DeleteOldData />
                    </TabContent>
                </div>
            </div>
        )
    };

    return (
        <Layout>
            {showSettingsPage()}
        </Layout>
    )
}

export default Settings;
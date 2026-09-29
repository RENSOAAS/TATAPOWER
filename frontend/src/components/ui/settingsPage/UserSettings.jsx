import React, { useEffect, useState } from 'react';
import UserTable from '../UserSettingsTable'
import { API } from "../../../config"
import "./userSettings.css"

const UserSettings = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        let isMounted = true;
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API}/getUsers`);
                const result = await res.json();
                if (isMounted) {
                    setUsers(result.users)
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchUsers();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className='user-settings--container'>
            <UserTable data={users} setData={setUsers} />
        </div>
    )
};

export default UserSettings
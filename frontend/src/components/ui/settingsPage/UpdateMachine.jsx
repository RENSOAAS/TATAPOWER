import React, { useEffect, useState } from 'react'
import MachinesTable from "../MachinesTable"
import { API } from '../../../config';
import "./updateMachine.css"

const UpdateMachine = () => {
    const [machines, setMachines] = useState([])

    useEffect(() => {
        let isMounted = true;
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${API}/getMachines`);
                const result = await res.json();
                if (isMounted) {
                    setMachines(result.machines)
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
        <div className='machine-settings--container'>
            <MachinesTable data={machines} setData={setMachines} />
        </div>
    )
};

export default UpdateMachine
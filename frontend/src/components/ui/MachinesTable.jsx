import React, { useState } from "react";
import { BsPencilSquare } from "react-icons/bs";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { API } from "../../config";

const MachinesTable = ({ data, setData }) => {
    const [editRow, setEditRow] = useState(null);
    // delete user confirmation
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [machineToDelete, setMachineToDelete] = useState({
        id: "",
        wegid: "",
    });

    // Update user details
    const handleCellEdit = (e, id, field) => {
        const newValue = e.target.innerText;
        const newData = data.map((row) => {
            if (row.id === id) {
                return { ...row, [field]: newValue };
            }
            return row;
        });
        setData(newData);
    };

    const handleEditClick = (row) => {
        setEditRow(row);
    };

    const handleSaveClick = () => {
        const updatedRow = data.find((row) => row.id === editRow.id);
        fetch(`${API}/updateMachineDetails`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedRow),
        })
            .then((response) => response.json())
            .then((data) => {
                setData((prevData) =>
                    prevData.map((row) => (row.id === data.id ? data : row))
                );
                setEditRow(null);
            })
            .catch((error) => console.error(error));
    };

    // Delete User
    const handleDeleteClick = (id, wegid) => {
        setShowDeleteConfirmation(true);
        setMachineToDelete({
            id: id,
            wegid: wegid,
        });
    };

    const handleDeleteConfirmation = () => {
        fetch(`${API}/removeMachine`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(machineToDelete),
        });

        const newData = data.filter((row) => row.id !== machineToDelete.id);
        setData(newData);

        setShowDeleteConfirmation(false);
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirmation(false);
    };

    // icons styling
    let iconStyles1 = { color: "green", fontSize: "1.25em", cursor: "pointer" };
    let iconStyles2 = { color: "red", fontSize: "1em", cursor: "pointer" };

    return (
        <>
            <table className="machine-settings--table">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Wegid</th>
                        <th>State</th>
                        <th>District</th>
                        <th>Area</th>
                        <th>Sub Area</th>
                        <th>Feeder Number</th>
                        <th>IoT Sim Number</th>
                        <th>Device Id</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.wegid}</td>
                            <td
                                contentEditable={editRow && editRow.id === row.id}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleCellEdit(e, row.id, "state")}
                            >
                                {row.state}
                            </td>
                            <td
                                contentEditable={editRow && editRow.id === row.id}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleCellEdit(e, row.id, "district")}
                            >
                                {row.district}
                            </td>
                            <td
                                contentEditable={editRow && editRow.id === row.id}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleCellEdit(e, row.id, "area")}
                            >
                                {row.area}
                            </td>
                            <td
                                contentEditable={editRow && editRow.id === row.id}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleCellEdit(e, row.id, "sub_area")}
                            >
                                {row.sub_area}
                            </td>
                            <td
                                contentEditable={editRow && editRow.id === row.id}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleCellEdit(e, row.id, "feeder_number")}
                            >
                                {row.feeder_number}
                            </td>
                            <td
                                contentEditable={editRow && editRow.id === row.id}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleCellEdit(e, row.id, "iot_sim_number")}
                            >
                                {row.iot_sim_number}
                            </td>
                            <td
                                contentEditable={editRow && editRow.id === row.id}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleCellEdit(e, row.id, "device_id")}
                            >
                                {row.device_id}
                            </td>
                            <td>
                                {editRow && editRow.id === row.id ? (
                                    <TiTick onClick={handleSaveClick} style={iconStyles1} />
                                ) : (
                                    <BsPencilSquare
                                        onClick={() => handleEditClick(row)}
                                        style={iconStyles1}
                                    />
                                )}
                            </td>
                            <td>
                                <ImCross
                                    onClick={() => handleDeleteClick(row.id, row.wegid)}
                                    style={iconStyles2}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showDeleteConfirmation && (
                <div className="delete-confirmation-popup">
                    <p>
                        If Deleted, data will be lost from DB!
                        <br /> Are you sure you want to "DELETE" this Machine?{" "}
                    </p>
                    <div className="delete-actions">
                        <button onClick={handleDeleteConfirmation}>Yes</button>
                        <button onClick={handleDeleteCancel}>No</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default MachinesTable;

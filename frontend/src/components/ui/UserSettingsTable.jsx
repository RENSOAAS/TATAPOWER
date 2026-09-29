import React, { useState } from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import { TiTick } from 'react-icons/ti';
import { ImCross } from "react-icons/im";
import { API } from '../../config';

const UserTable = ({ data, setData }) => {
    const [editRow, setEditRow] = useState(null);
    // Password change
    const [showPasswordChangePopup, setShowPasswordChangePopup] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    // delete user confirmation
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [idToDelete, setIdToDelete] = useState({})

    // Update user details
    const handleCellEdit = (e, id, field) => {
        const newValue =
            field === "role"
                ? e.target.value
                : field === "enable_emails" || field === "disable_login"
                    ? e.target.checked
                    : e.target.innerText || e.target.value;
        
        const newData = data.map(row => {
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
        const updatedRow = data.find(row => row.id === editRow.id);
        fetch(`${API}/updateUser`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedRow)
        })
            .then(response => response.json())
            .then(data => {
                setData(prevData => prevData.map(row => row.id === data.id ? data : row));
                setEditRow(null);
            })
            .catch(error => console.error(error));
    };

    // Update Password
    const handlePasswordChangeClick = (userId) => {
        setShowPasswordChangePopup(true);
        setSelectedUserId(userId);
    };

    const handlePasswordChangeSubmit = (e) => {
        e.preventDefault();
        fetch(`${API}/updatePassword`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: data.find((row) => row.id === selectedUserId).id,
                password: newPassword,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setShowPasswordChangePopup(false);
                setSelectedUserId(null);
                setNewPassword("");
            })
            .catch((error) => console.log(error));
    };

    const handlePasswordChangeCancel = () => {
        setShowPasswordChangePopup(false);
        setSelectedUserId(null);
        setNewPassword("");
    };

    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    // Delete User
    const handleDeleteClick = (id) => {
        // Show confirmation popup
        setShowDeleteConfirmation(true);
        // Store the ID of the user to be deleted in state
        setIdToDelete(id);
    };

    // Handle user confirmation for deleting a user
    const handleDeleteConfirmation = () => {
        // Remove the user from the server
        fetch(`${API}/removeUser`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: idToDelete })
        });

        // Remove the user from the table
        const newData = data.filter((row) => row.id !== idToDelete);
        setData(newData);

        // Hide the confirmation popup
        setShowDeleteConfirmation(false);
    };

    // Handle user cancellation of deleting a user
    const handleDeleteCancel = () => {
        // Hide the confirmation popup
        setShowDeleteConfirmation(false);
    };

    let iconStyles1 = { color: "green", fontSize: "1.25em", cursor: "pointer" };
    let iconStyles2 = { color: "red", fontSize: "1em", cursor: "pointer" };

    return (
        <>
            <table className='user-settings--table'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Disable Login</th>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Enable Emails</th>
                        <th>Password</th>
                        <th>Role</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row.id}>
                            <td>{row.id}</td>
                            {/* disable login */}
                            <td>
                                {editRow && editRow.id === row.id ? (
                                    <input
                                        type="checkbox"
                                        checked={row.disable_login}
                                        onChange={(e) => handleCellEdit(e, row.id, "disable_login")}
                                    />
                                ) : (
                                    <input
                                        type="checkbox"
                                        checked={row.disable_login}
                                        disabled
                                    />
                                )}
                            </td>
                            <td
                                contentEditable={editRow && editRow.id === row.id}
                                suppressContentEditableWarning={true}
                                onBlur={e => handleCellEdit(e, row.id, 'user_name')}
                            >
                                {row.user_name}
                            </td>
                            <td
                                contentEditable={editRow && editRow.id === row.id}
                                suppressContentEditableWarning={true}
                                onBlur={e => handleCellEdit(e, row.id, 'email')}
                            >
                                {row.email}
                            </td>
                            {/* Enable emails */}
                            <td>
                                {editRow && editRow.id === row.id ? (
                                    <input
                                        type="checkbox"
                                        checked={row.enable_emails}
                                        onChange={(e) => handleCellEdit(e, row.id, "enable_emails")}
                                    />
                                ) : (
                                    <input
                                        type="checkbox"
                                        checked={row.enable_emails}
                                        disabled
                                    />
                                )}
                            </td>
                            <td>
                                {editRow && editRow.id === row.id ? (
                                    <button
                                        className='change-password-button'
                                        onClick={() => handlePasswordChangeClick(row.id)}
                                    >
                                        Change Password
                                    </button>
                                ) : (
                                    <button
                                        className='change-password-button'
                                        disabled
                                    >
                                        Change Password
                                    </button>
                                )}
                            </td>
                            <td>
                                {editRow && editRow.id === row.id ? (
                                    <select
                                        value={row.role}
                                        onChange={(e) => handleCellEdit(e, row.id, "role")}
                                    >
                                        <option value="0">User</option>
                                        <option value="1">Admin</option>
                                    </select>
                                ) : row.role === 1 ? (
                                    "Admin"
                                ) : (
                                    "User"
                                )}
                            </td>
                            <td>
                                {editRow && editRow.id === row.id ? (
                                    <TiTick onClick={handleSaveClick} style={iconStyles1} />
                                ) : (
                                    <BsPencilSquare onClick={() => handleEditClick(row)} style={iconStyles1} />
                                )}
                            </td>
                            <td>
                                <ImCross onClick={() => handleDeleteClick(row.id)} style={iconStyles2} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showPasswordChangePopup && (
                <div className="password-change-popup">
                    <form onSubmit={handlePasswordChangeSubmit}>
                        <div className="password-input">
                            <label>Enter New Password:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <div className="password-actions">
                            <button type="submit">Save</button>
                            <button onClick={handlePasswordChangeCancel}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            {showDeleteConfirmation && (
                <div className="delete-confirmation-popup">
                    <p>Are you sure you want to "DELETE" this user?</p>
                    <div className="delete-actions">
                        <button onClick={handleDeleteConfirmation}>Yes</button>
                        <button onClick={handleDeleteCancel}>No</button>
                    </div>
                </div>
            )}

        </>
    );
};

export default UserTable;

























// import React, { useState } from 'react';
// import { BsPencilSquare } from 'react-icons/bs';
// import { TiTick } from 'react-icons/ti';
// import { ImCross } from "react-icons/im";
// import { API } from '../../config';

// const UserTable = ({ data, setData }) => {
//     const [editRow, setEditRow] = useState(null);
//     const handleCellEdit = (e, id, field) => {
//         const newData = data.map(row => {
//             if (row.id === id) {
//                 return { ...row, [field]: e.target.innerText };
//             }
//             return row;
//         });

//         const updatedRow = newData.find(row => row.id === id);
//         fetch(`${API}/updateUser`, {
//             method: "PUT",
//             headers: {
//                 Accept: "application/json",
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(updatedRow)
//         });
//     };

//     const handleEditClick = (row) => {
//         setEditRow(row);
//     };

//     const handleSaveClick = () => {
//         setEditRow(null);
//     };

//     const handleDeleteClick = (id) => {
//         const newData = data.filter((row) => row.id !== id);
//         fetch(`${API}/removeUser`, {
//             method: "DELETE",
//             headers: {
//                 Accept: "application/json",
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({id})
//         });
//         setData(newData)
//     };

//     let iconStyles1 = { color: "green", fontSize: "1.25em", cursor: "pointer" };
//     let iconStyles2 = { color: "red", fontSize: "1em", cursor: "pointer" };

//     return (
//         <>
//             <table className='user-settings--table'>
//                 <thead>
//                     <tr>
//                         <th>Id</th>
//                         <th>First Name</th>
//                         <th>Last Name</th>
//                         <th>User Name</th>
//                         <th>Email</th>
//                         <th>Role</th>
//                         <th>Edit</th>
//                         <th>Delete</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map(row => (
//                         <tr key={row.id}>
//                             <td>{row.id}</td>
//                             <td contentEditable={editRow && editRow.id === row.id} onBlur={e => handleCellEdit(e, row.id, 'first_name')}>
//                                 {row.first_name}
//                             </td>
//                             <td contentEditable={editRow && editRow.id === row.id} onBlur={e => handleCellEdit(e, row.id, 'last_name')}>
//                                 {row.last_name}
//                             </td>
//                             <td contentEditable={editRow && editRow.id === row.id} onBlur={e => handleCellEdit(e, row.id, 'user_name')}>
//                                 {row.user_name}
//                             </td>
//                             <td contentEditable={editRow && editRow.id === row.id} onBlur={e => handleCellEdit(e, row.id, 'email')}>
//                                 {row.email}
//                             </td>
//                             <td contentEditable={editRow && editRow.id === row.id} onBlur={e => handleCellEdit(e, row.id, 'role')}>
//                                 {parseInt(row.role)}
//                             </td>
//                             <td>
//                                 {editRow && editRow.id === row.id ? (
//                                     <TiTick onClick={handleSaveClick} style={iconStyles1} />
//                                 ) : (
//                                     <BsPencilSquare onClick={() => handleEditClick(row)} style={iconStyles1} />
//                                 )}
//                             </td>
//                             <td>
//                                 <ImCross onClick={() => handleDeleteClick(row.id)} style={iconStyles2} />
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </>
//     );
// };

// export default UserTable;

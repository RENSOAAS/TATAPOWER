import React, { useState } from 'react'
import { API } from '../../../config';
import "./deleteOldData.css"

const DeleteOldData = () => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [values, setValues] = useState({
        error: '',
        success: false,
        message: ''
    })

    const { error, success, message } = values;

    const handleDeleteClick = () => {
        // Show confirmation popup
        setShowDeleteConfirmation(true);
    };

    // Handle user confirmation for deleting a user
    const handleDeleteConfirmation = async () => {
        // Remove the user from the server
        const res = await fetch(`${API}/deleteOldData`);
        const data = await res.json()

        if (!data.status) {
            setValues({
                ...values,
                error: data.message
            })
        } else {
            setValues({
                ...values,
                success: true,
                message: data.message
            })
        }

        // Hide the confirmation popup
        setShowDeleteConfirmation(false);
    };

    // Handle user cancellation of deleting a user
    const handleDeleteCancel = () => {
        // Hide the confirmation popup
        setShowDeleteConfirmation(false);
    };

    const showError = () => (
        <div
            className='alert alert-danger'
            style={{ display: error ? '' : 'none' }}
        >
            {error}
        </div>
    );

    const showSuccess = () => (
        <div
            className='alert alert-info'
            style={{ display: success ? '' : 'none' }}
        >
            {message}
        </div>
        
    );

    return (
        <div className='delete-old-data--container'>
            {/* Error Success Message */}
            {showError()}
            {showSuccess()}
            <div className='delete-old-data--wrapper'>
                <p>Delete data older than 3 months:</p>
                <button onClick={() => handleDeleteClick()}>Delete</button>
                {showDeleteConfirmation && (
                    
                    <div className="delete-confirmation-popup">
                        <p>Are you sure you want to "DELETE" this user?</p>
                        <div className="delete-actions">
                            <button onClick={handleDeleteConfirmation}>Yes</button>
                            <button onClick={handleDeleteCancel}>No</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DeleteOldData
import { API } from "../config";

export const authenticate = (data, next) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('jwt', JSON.stringify(data));
        next();
    }
};

export const logout = async (next) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt');
        next();
        try {
            const res = await fetch(`${API}/logout`, {
                method: "GET"
            });
            const resData = await res.json();
            console.log(resData.message);
        } catch (err) {
            console.log(err.message);
        }
    }
};

export const isAuthenticated = () => {
    if (typeof window == 'undefined') {
        return false;
    }
    if (localStorage.getItem('jwt')) {
        return JSON.parse(localStorage.getItem('jwt'));
    } else {
        return false;
    }
};

export const isAdmin = () => {
    if (typeof window == 'undefined') {
        return false;
    }
    if (localStorage.getItem('jwt')) {
        const items = JSON.parse(localStorage.getItem('jwt'));
        const userRole = items.user.role;
        if (userRole === 1) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};
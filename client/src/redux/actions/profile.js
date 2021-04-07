import axios from 'axios';
import { GET_PROFILE, PROFILE_ERROR, UPDATE_PROFILE } from './types';

import { setAlert } from './alert';

// Get current users profile
export const getCurrentProfile = () => async (dispatch) => {
    try {
        const res = await axios.get('api/profile/me');

        dispatch({
            type: GET_PROFILE,
            payload: res.data,
        });
    } catch (err) {
        const { statusText, status } = err.response;

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: statusText, status },
        });
    }
};

// Create/Update a Profile
export const createProfile = (formData, history, edit = false) => async (dispatch) => {
    try {
        const res = await axios.post('api/profile', formData);

        dispatch({
            type: GET_PROFILE,
            payload: res.data,
        });

        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

        if (!edit) {
            history.push('/dashboard');
        }
    } catch (err) {
        const errors = err.response.data.errors;

        if (errors) {
            errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
        }

        const { statusText, status } = err.response;

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: statusText, status },
        });
    }
};

// Add Experience
export const addExperience = (formData, history) => async (dispatch) => {
    try {
        const res = await axios.put('api/profile/experience', formData);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data,
        });

        dispatch(setAlert('Experience Added', 'success'));

        history.push('/dashboard');
    } catch (err) {
        const errors = err.response.data.errors;

        if (errors) {
            errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
        }

        const { statusText, status } = err.response;

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: statusText, status },
        });
    }
};

// Add Education
export const addEducation = (formData, history) => async (dispatch) => {
    try {
        const res = await axios.put('api/profile/education', formData);

        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data,
        });

        dispatch(setAlert('Education Added', 'success'));

        history.push('/dashboard');
    } catch (err) {
        const errors = err.response.data.errors;

        if (errors) {
            errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
        }

        const { statusText, status } = err.response;

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: statusText, status },
        });
    }
};
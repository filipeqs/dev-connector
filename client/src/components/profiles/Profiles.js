import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Spinner from '../layout/Spinner';
import ProfileItem from './ProfileItem';

import { getProfiles } from '../../redux/actions/profile';

const Profiles = ({ profile: { profiles, loading }, getProfiles }) => {
    useEffect(() => {
        getProfiles();
    }, [getProfiles]);

    return (
        <Fragment>
            {loading ? (
                <Spinner />
            ) : (
                <Fragment>
                    <h1 className="large text-primary">Developers</h1>
                    <p className="lead">
                        <i className="fab fa-connectdevelop"> Browse and connect with developers</i>
                    </p>
                    <div className="profiles">
                        {profiles.length > 0 ? (
                            profiles.map((profile) => (
                                <ProfileItem key={profile._id} profile={profile} />
                            ))
                        ) : (
                            <h4>No profiles found...</h4>
                        )}
                    </div>
                </Fragment>
            )}
        </Fragment>
    );
};

Profiles.propTypes = {
    profile: PropTypes.object.isRequired,
    getProfiles: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    profile: state.profile,
});

export default connect(mapStateToProps, { getProfiles })(Profiles);

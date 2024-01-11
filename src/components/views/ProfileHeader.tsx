
import { useContext, useEffect, useState } from 'react';
import { AccountContext, AccountContextType } from '../Account';
import ProfileRegistration from '../windows/ProfileRegistration';

// A profile part of the header. 
export default function ProfileHeader() {
    const accountCtx = useContext<AccountContextType>(AccountContext);
    const [ displayRegistrationForm, setDisplayRegistrationForm ] = useState<boolean>(false);

    useEffect(() => {
        if ( accountCtx.isRegistered ) {
            setDisplayRegistrationForm(false);
        }
        

    }, [accountCtx.isRegistered]);

  
    if (accountCtx.isRegistered) {
        return (
            <div>
                <img src={accountCtx.avatar} className="img-fluid p-1" alt="" style={{maxWidth: "30px"}} />
                <span className="ms-1">{accountCtx.nickname}</span>
            </div>
        );
    }
    else {
        return (
            <div>
                <button className="btn btn-primary" 
                    onClick={()=>{setDisplayRegistrationForm(true)}}>
                        Register Account
                </button> 
                { displayRegistrationForm && <ProfileRegistration disableRegistrationForm={()=>{setDisplayRegistrationForm(false)}} /> }
            </div>
        );
    }
}
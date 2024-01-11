import { useState, useContext, useEffect } from 'react';

import {TwitterContractContext, TwitterContractContextType} from '../TwitterContract';
import { ConnectionContext } from '../ConnectionManager';
import { AccountContext, AccountContextType } from '../Account';

export type ProfileRegistrationProps = {
    disableRegistrationForm: ()=>void
}

// The registration window. 
export default function ProfileRegistration(props:ProfileRegistrationProps) {

    const accountCtx = useContext<AccountContextType>(AccountContext);
    const twitterContractCtx = useContext<TwitterContractContextType>(TwitterContractContext);
    const connectionCtx = useContext(ConnectionContext);

    const [nickname, setNickname] = useState<string>("");
    const [avatarURL, setAvatarURL] = useState<string>("");
    const [sentSubmit, setSentSubmit] = useState<boolean>(false);

    async function register() {
        setSentSubmit(true);
        let result = await connectionCtx.sendTransactionWithWindow(twitterContractCtx.contract?.register(nickname, avatarURL));
        if(!result) {
            setSentSubmit(false);
        }
    }

    useEffect(() => {
        if (sentSubmit && accountCtx.isRegistered) {
            setSentSubmit(false);
        }
    }, [sentSubmit, accountCtx.isRegistered]);

    return ( 
        <div className="position-fixed top-0 start-0 bottom-0 end-0" style={{background: "rgba(0,0,0,0.6)"}}>
            <div className="bg-light position-fixed top-50 start-50 translate-middle" style={{width: "600px"}}>
                <div className="d-flex justify-content-between bg-dark text-white p-1">
                    <div>Registration</div>
                    <button onClick={ props.disableRegistrationForm }>X</button>
                </div>
                <div className="m-2">
                    <div className="row">
                        <div className="col">
                            Nickname
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <input type="text" id="register_nickname" className="form-control" value={ nickname } onInput={ (e:React.ChangeEvent<HTMLInputElement>)=>{ setNickname(e.target.value); } } />
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col">
                            Avatar URL
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <input type="text" id="register_avatar" className="form-control" value={ avatarURL } onInput={( e:React.ChangeEvent<HTMLInputElement> )=>{ setAvatarURL(e.target.value); }} placeholder="https://yoursite.com/img.png" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <button className="btn btn-primary w-100 mt-4" onClick={() => { register(); }} disabled={ sentSubmit }>Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


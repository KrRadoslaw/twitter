//import { ethers } from 'ethers';
import { useContext } from 'react';
import ProfileHeader from './ProfileHeader';
import { ConnectionContext, ConnectionDataTypes } from '../ConnectionManager';

// the header bar visible on the website. 
export default function Header() {
    const connectionContext = useContext<ConnectionDataTypes>(ConnectionContext);

    return (
        <div className="shadow-sm">
            <div className="container d-flex">
                <div>
                    <ProfileHeader />
                </div>
                <div className="ms-auto">
                    {
                        connectionContext.isConnected ? 
                            connectionContext.walletAddress.substring(0, 10) + "..." : 
                            <button className="btn btn-primary" onClick={()=>{connectionContext.connect()}}>Connect wallet</button>
                    }
                </div>
            </div>
        </div>
    );
}
import { useContext } from "react";
import { AccountContext, AccountContextType } from "../Account";
import { ConnectionContext, ConnectionDataTypes } from "../ConnectionManager";

// The left column on the website. 
export default function LeftCol(){
    const accountCtx = useContext<AccountContextType>(AccountContext);
    const connectionCtx = useContext<ConnectionDataTypes>(ConnectionContext);
    return (
        <div className="mt-3">
            <div className="d-flex flex-column">
                {
                    accountCtx.isRegistered &&
                        <div>
                            <div>Account: {accountCtx.nickname}</div>
                            <div>Address: {connectionCtx.walletAddress.substring(0,8)}...{connectionCtx.walletAddress.substring(connectionCtx.walletAddress.length - 8)}</div>
                            <div>User ID: {accountCtx.accountId.toString()}</div>
                        </div> 
                }
                
            </div>
        </div>
    );
}
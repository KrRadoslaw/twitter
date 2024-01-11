import { useContext, createContext, useState, useEffect } from 'react';
import { TwitterContractContext, TwitterContractContextType } from './TwitterContract';
import { ConnectionContext, ConnectionDataTypes } from './ConnectionManager';

export type AccountContextType = {
    isRegistered: boolean,
    accountId: number,
    avatar: string,
    nickname: string
}

export const AccountContext = createContext<AccountContextType>({
    isRegistered: false,
    accountId: -1,
    avatar: '',
    nickname: '',
});

// The current user account management. 
export default function Account({children}:any) {
    const connectionCtx = useContext<ConnectionDataTypes>(ConnectionContext);
    const twitterContractCtx = useContext<TwitterContractContextType>(TwitterContractContext);

    const [ isRegistered, setIsRegistered ] = useState<boolean>(false);
    const [ accountId, setAccountId ] = useState<number>(-1);
    const [ avatar, setAvatar ] = useState<string>('');
    const [ nickname, setNickname ] = useState<string>('');

    useEffect(()=>{
        if(connectionCtx.isConnected && twitterContractCtx.initialized) {
            (async()=>{
                const accountId = await twitterContractCtx.contract?.accountIds(connectionCtx.walletAddress);
                const accountData = await twitterContractCtx.contract?.accounts(accountId.toString());
                setIsRegistered(accountData.registered);
                setAccountId(accountId);
                setAvatar(accountData.avatar);
                setNickname(accountData.nickname);
                
            })();
        }
    }, [connectionCtx.isConnected, connectionCtx.walletAddress, twitterContractCtx.initialized, twitterContractCtx.contract, twitterContractCtx.newAccountRegistered])

    const value: AccountContextType = {
        isRegistered: isRegistered,
        accountId: accountId,
        avatar: avatar,
        nickname: nickname
    }

    return(
        <AccountContext.Provider value={value}>
            {children}
        </AccountContext.Provider>
    )
}
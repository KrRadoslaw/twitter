import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers, ContractTransactionResponse  } from 'ethers';
import { WindowContext, Modals } from './windows/WindowManager';
import BigNumber from 'bignumber.js';

export const chainId = "0x" + new BigNumber("1337").toString(16);

export const enum ConnectionStatuses {
    NOT_CONNECTED,
    CONNECTING,
    CONNECTED
}

export type ConnectionDataTypes = {
    connectionStatus: ConnectionStatuses, 
    isConnected: boolean,
    walletAddress: string, 
    provider: any,
    pendingTransactions: ContractTransactionResponse[],
    connect: () => Promise<boolean>,
    disconnect: () => void,
    resetStatus: () => void,
    addPendingTransaction: (receipt: ContractTransactionResponse)=>void,
    sendTransactionWithWindow: (arg1: Promise<any>|undefined)=>Promise<boolean>;
}

export const ConnectionContext = createContext<ConnectionDataTypes>({
    connectionStatus: ConnectionStatuses.NOT_CONNECTED,
    isConnected: false,
    walletAddress: "",
    provider: null, 
    pendingTransactions: [],
    connect: async()=>{ return false; },
    disconnect: ()=>{ },
    resetStatus: ()=>{ },
    addPendingTransaction: ( receipt )=>{ },
    sendTransactionWithWindow: async(arg1: Promise<any>|undefined)=>{return false;}
});

// Connection Manager is responsible for web3 communication and transaction management. 
export default function ConnectionManager({ children } : { children:any }) {
    const windowCtx = useContext(WindowContext);

    const [ connectionStatus, setConnectionStatus ] = useState<ConnectionStatuses>(ConnectionStatuses.NOT_CONNECTED);
    const [ walletAddress, setWalletAddress ] = useState<string>("");
    const [ provider, setProvider ] = useState<any | null>(null);
    const [ pendingTransactions, setPendingTransactions ] = useState<ContractTransactionResponse[]>([]);

    const sendTransactionWithWindow = async (pPromise : Promise<any>|undefined) => {
        windowCtx.setWindowType(Modals.WAITING_FOR_TRANSACTION);
        try {
            const receipt = await pPromise;
            addPendingTransaction(receipt);
            await receipt.wait();
            windowCtx.setWindowType(Modals.NOTHING);

            return true;
        }
        catch(e) {
            windowCtx.setWindowType(Modals.REJECTED_TRANSACTION); 
            console.log(e);

            return false;
        }
    }

    function saveData(account:string) {
        setProvider(new ethers.BrowserProvider(window.ethereum));
        setConnectionStatus(ConnectionStatuses.CONNECTED);
        setWalletAddress(ethers.getAddress(account));
    }

    const connect = async () => {
        if(typeof window.ethereum == 'undefined' || window.ethereum == null) {
            windowCtx.setWindowType(Modals.NO_METAMASK);
            return false;
        }
        setConnectionStatus(ConnectionStatuses.CONNECTING);
        const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
        if(currentChain !== chainId) {
            windowCtx.setWindowType(Modals.CONNECTING_CHAIN);
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: chainId }]
                });
                    
            }
            catch(e) {
                windowCtx.setWindowType(Modals.WRONG_NETWORK);
                return false;
            }
            
            try {
                window.ethereum.on('chainChanged', function(networkId : string){
                    if(networkId !== chainId) {
                        windowCtx.setWindowType(Modals.WRONG_NETWORK);
                        return false;
                    }
                });
            }
            catch(e) {
                windowCtx.setWindowType(Modals.REJECTED_CHAIN_CHANGE);
                return false;
            }
        }
        try {
            windowCtx.setWindowType(Modals.CONNECTING_ACCOUNTS);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            saveData(accounts[0]);
            windowCtx.setWindowType(Modals.NOTHING);
        }
        catch(e) {
            windowCtx.setWindowType(Modals.REJECTED_ACCOUNT_CONNECTING);
            return false;
        }

        return true;
    }

    const disconnect = async() => {
        setProvider(null)
        setConnectionStatus(ConnectionStatuses.NOT_CONNECTED)
        setWalletAddress("")
    }

    const resetStatus = async() => {
        setConnectionStatus(ConnectionStatuses.NOT_CONNECTED);
    }

    const addPendingTransaction = async(receipt : ContractTransactionResponse) => {
        setPendingTransactions(prevPendingTransactions => [
            ...prevPendingTransactions, receipt
        ]);
    }

    const tryConnectInBackground = useCallback(async() => {
        if(typeof window.ethereum == 'undefined' || window.ethereum == null) {
            return;
        }
        let connected = false;
        let accounts;
        try {
            accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            if(accounts.length > 0) {
                connected = true;
            }
        }
        catch(e) { }
        
        if(!connected) {
            return;
        }

        try {
            const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
            if(currentChain === chainId) {
                saveData(accounts[0]);
            }
            else  {
                return false;
            }
        }
        catch(e) {
            return false;
        }
    }, []);

    const handleAccountsChanged = useCallback(async(accounts : Array<string>) => {
        if(typeof window.ethereum == 'undefined' || window.ethereum == null) {
            return;
        }
        if(accounts.length > 0) {
            setWalletAddress(accounts[0]);
        }
        else {
            windowCtx.setWindowType(Modals.REJECTED_ACCOUNT_CONNECTING);
            setConnectionStatus(ConnectionStatuses.NOT_CONNECTED);
        }
    }, [windowCtx]);

    const handleChainChanged = useCallback(async(networkId : string) => {
        try {
            if(networkId === chainId) {
                tryConnectInBackground();
                setConnectionStatus(ConnectionStatuses.CONNECTING);
            }
            else {
                windowCtx.setWindowType(Modals.WRONG_NETWORK);
                setConnectionStatus(ConnectionStatuses.NOT_CONNECTED);
            }
        }
        catch(e) {
            windowCtx.setWindowType(Modals.REJECTED_CHAIN_CHANGE);
        }
    }, [windowCtx, tryConnectInBackground]);

    useEffect(()=>{
        if(typeof window.ethereum == 'undefined' || window.ethereum == null) {
            return;
        }
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        return () => {
            window.ethereum.removeListener('chainChanged', handleChainChanged);
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, [handleAccountsChanged, handleChainChanged]);

    useEffect(()=>{
        (async () => {

            tryConnectInBackground();
        })();
    }, [tryConnectInBackground]);

    const contextValues : ConnectionDataTypes = {
        connectionStatus: connectionStatus,
        isConnected: connectionStatus === ConnectionStatuses.CONNECTED,
        walletAddress: walletAddress,
        provider: provider,
        pendingTransactions: pendingTransactions,
        connect: connect,
        disconnect: disconnect,
        resetStatus: resetStatus,
        addPendingTransaction: addPendingTransaction,
        sendTransactionWithWindow: sendTransactionWithWindow
    }                                                                                                                                                                                                           

    return (
        <ConnectionContext.Provider value={ contextValues }>
            { children }
        </ConnectionContext.Provider>
    )
}
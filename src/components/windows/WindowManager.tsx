import { createContext, useState } from 'react';

interface WindowManagerButton {
    text: string,
    handleClick: () => void
}

export type ModalTypes = {
    windowType: Modals,
    setWindowType: (modalType : Modals) => void
}

type WindowManagerContentElement = {
    display: boolean,
    title: String | null,
    message: React.JSX.Element | null,
    buttons: Array<WindowManagerButton>
}

export const enum Modals {
    NOTHING,
    CONNECTING_ACCOUNTS,
    CONNECTING_CHAIN,
    WAITING_FOR_TRANSACTION,
    NO_METAMASK,
    WRONG_NETWORK,
    REJECTED_CHAIN_CHANGE,
    REJECTED_ACCOUNT_CONNECTING,
    REJECTED_TRANSACTION
}

export const WindowContext = createContext<ModalTypes>({
    windowType: Modals.NOTHING,
    setWindowType: (modalType) => { }
});

// A popup window management with buttons. 
export default function WindowManager( { children} : { children: any }) {
    const [windowType, setWindowType] = useState<Modals>(Modals.NOTHING);

    const WindowManagerContents : Record<Modals, WindowManagerContentElement> = {
        [Modals.NOTHING]: { 
            display: false,
            title: null, 
            message: null, 
            buttons: []
        },

        [Modals.CONNECTING_ACCOUNTS]: {
            display: true,
            title: "Connecting...",
            message: 
                <div>
                    <span className="">Waiting for the connection of the Metamask wallet to the website...</span>
                    <div className="d-flex flex-column align-items-center">
                        <img className="img-fluid mt-3" style={{maxWidth: "10rem"}} src={require('./../../img/hourglass.gif')} alt="" />
                    </div>
                </div>,
            buttons: []
        },

        [Modals.CONNECTING_CHAIN]: {
            display: true,
            title: "Connecting...",
            message: 
                <div>
                    <span className="">Waiting for a network change...</span>
                    <div className="d-flex flex-column align-items-center">
                        <img className="img-fluid mt-3" style={{maxWidth: "10rem"}} src={require('./../../img/hourglass.gif')} alt="" />
                    </div>
                </div>,
            buttons: []
        },

        [Modals.WAITING_FOR_TRANSACTION]: {
            display: true,
            title: "Sending...",
            message: 
                <div>
                    <span className="">Waiting for the transaction to be accepted...</span>
                    <div className="d-flex flex-column align-items-center">
                        <img className="img-fluid mt-3" style={{maxWidth: "10rem"}} src={require('./../../img/hourglass.gif')} alt="" />
                    </div>
                </div>,
            buttons: []
        },

        [Modals.NO_METAMASK]: {
            display: true,
            title: "Information",
            message: <div>Metamask has not been installed. </div>,
            buttons: [
                { text: "ok", handleClick: ()=>{ setWindowType(Modals.NOTHING) } }
            ]
        },

        [Modals.WRONG_NETWORK]: {
            display: true,
            title: "Information",
            message: <div>Wrong network. </div>,
            buttons: [
                { text: "ok", handleClick: ()=>{ setWindowType(Modals.NOTHING) } }
            ]
        },

        [Modals.REJECTED_CHAIN_CHANGE]: {
            display: true,
            title: "Information",
            message: <div>Chain change was rejected. </div>,
            buttons: [
                { text: "ok", handleClick: ()=>{ setWindowType(Modals.NOTHING) } }
            ]
        },

        [Modals.REJECTED_ACCOUNT_CONNECTING]: {
            display: true,
            title: "Information",
            message: <div>Account is not connected. </div>,
            buttons: [
                { text: "ok", handleClick: ()=>{ setWindowType(Modals.NOTHING) } }
            ]
        },

        [Modals.REJECTED_TRANSACTION]: {
            display: true,
            title: "Information",
            message: <div>Transaction was rejected. </div>,
            buttons: [
                { text: "ok", handleClick: ()=>{ setWindowType(Modals.NOTHING) } }
            ]
        },
    }

    const WindowManager = WindowManagerContents[windowType];

    const contextValues : ModalTypes = {
        windowType,
        setWindowType
    }

    if(!WindowManager.display) {
        return (
            <WindowContext.Provider value={ contextValues }>
                { children }
            </WindowContext.Provider>
        );
    }

    const buttons : Array<JSX.Element> = [];
    WindowManager.buttons.forEach((button, index)=>{
        buttons.push(
            <button key={index + button.text} className="btn btn-primary mt-3" onClick={ button.handleClick }>{ button.text }</button>
        );
    });

    return (
        <WindowContext.Provider value={ contextValues }>
            { children }
            <div className="position-fixed top-0 start-0 w-100 h-100" style={{background: "rgba(0,0,0,0.6)"}}>
                <div className="position-fixed top-50 start-50 translate-middle bg-light border rounded-4 shadow-sm">
                    <div className="d-flex flex-column align-items-center p-3" style={{fontSize: "1.3rem", maxWidth: "18rem"}}>
                        <div className="w-100 d-flex fw-bold">{WindowManager.title}</div>
                        <span className="">{WindowManager.message}</span>
                        <div className="d-flex">
                            {buttons}
                        </div>
                    </div>
                </div>            
            </div>
        </WindowContext.Provider>
    );
}
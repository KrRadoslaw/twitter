import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { TwitterContractContext, TwitterContractContextType } from "../TwitterContract";
import { ConnectionContext, ConnectionDataTypes } from "../ConnectionManager";

export type FastResponsePropsType = {
    fastResponseData: FastResponseData, 
    setFastResponseData:Dispatch<SetStateAction<FastResponseData>>,
}

export type FastResponseData = {
    show: boolean,
    postId: number,
    edit: boolean,
    message: string,
    replyNickname: string
}

// This is a small popup used to quick edit or quick reply. 
export default function FastResponse(props : FastResponsePropsType) {
    const twitterContractCtx = useContext<TwitterContractContextType>(TwitterContractContext);
    const connectionCtx = useContext<ConnectionDataTypes>(ConnectionContext);
    
    const [newPost, setNewPost] = useState<string>("");

    const close = useCallback(()=>{
        props.setFastResponseData({
            show: false,
            postId: -1,
            edit: false,
            message: "",
            replyNickname: ""
        });
    }, [props]);
    
    const sendPost = useCallback(()=>{
        (async()=>{
            const result = await (
                props.fastResponseData.edit ? 
                connectionCtx.sendTransactionWithWindow(twitterContractCtx.contract?.editPost(props.fastResponseData.postId, newPost)) : 
                connectionCtx.sendTransactionWithWindow(twitterContractCtx.contract?.post(newPost, props.fastResponseData.postId||"0"))
            );
            if(result) {
                close();
                setNewPost(""); 
            }
        })();
    }, [close, connectionCtx, newPost, props.fastResponseData.edit, props.fastResponseData.postId, twitterContractCtx.contract]);

    useEffect(()=>{
        if(props.fastResponseData.edit) {
            setNewPost(props.fastResponseData.message);
        }
        else {
            setNewPost(""); 
        }
    }, [props.fastResponseData.edit, props.fastResponseData.message]);


    return ( 
        <div className="position-fixed top-0 start-0 bottom-0 end-0" style={{background: "rgba(0,0,0,0.6)"}}>
            <div className="bg-light position-fixed top-50 start-50 translate-middle" style={{width: "600px"}}>
                <div className="d-flex justify-content-between bg-dark text-white p-1">
                    <div>{props.fastResponseData.edit ? "Edit post" : "Add reply"}</div>
                    <button onClick={ close }>X</button>
                </div>
                <div className="m-2">
                    <div className="row">
                        <div className='col-10'>
                            <textarea className="form-control" placeholder={ props.fastResponseData.edit ? ("Post something here") : ("Post reply to " + props.fastResponseData.replyNickname  + " here...") } value={newPost} onInput={
                                (e:React.ChangeEvent<HTMLTextAreaElement>)=>{setNewPost(e.target.value)}
                            } />
                        </div>
                        <div className='col-2 my-auto'> 
                            <button className='btn btn-primary w-100' onClick={sendPost}>Send</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}